import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { BarbershopSaasPublicHttpService } from '../services/barbershop-saas-public-http.service';
import { BarbershopDiscoveryCardInterface } from '../../../core/models/barbershop-saas.models';
import { BarbershopServiceOfferingInterface } from '../../../core/models/barbershop-saas.models';

@Component({
    selector: 'app-client-discovery-page',
    imports: [DecimalPipe, RouterLink, Button, Card, Dialog, InputText, Tag, FormsModule],
    templateUrl: './client-discovery-page.component.html',
    styleUrl: './client-discovery-page.component.scss',
})
export class ClientDiscoveryPageComponent implements OnInit {
    private static readonly referenceRegionLatitudeForDiscoveryFallback = -23.55052;
    private static readonly referenceRegionLongitudeForDiscoveryFallback = -46.633308;

    private readonly barbershopSaasPublicHttpService = inject(
        BarbershopSaasPublicHttpService
    );

    protected readonly barbershopsSignal = signal<BarbershopDiscoveryCardInterface[]>([]);
    protected readonly nearbyDiscoveryRequestFinishedSignal = signal(false);
    protected readonly nearbyDiscoveryLoadingSignal = signal(true);
    protected readonly nearbyDiscoveryErrorMessageSignal = signal<string | null>(null);
    protected readonly locationMessageSignal = signal<string>(
        'Obtendo localizacao para buscar barbearias...'
    );
    protected readonly searchQuerySignal = signal('');
    protected readonly latitudeSignal = signal<number | null>(null);
    protected readonly longitudeSignal = signal<number | null>(null);

    protected readonly servicesDialogVisibleSignal = signal(false);
    protected readonly servicesForSelectedSignal = signal<
        BarbershopServiceOfferingInterface[]
    >([]);
    protected readonly servicesDialogLoadingSignal = signal(false);
    protected readonly servicesDialogErrorMessageSignal = signal<string | null>(null);

    public ngOnInit(): void {
        const initializeDiscoveryWithCoordinates = (
            latitude: number,
            longitude: number,
            userFacingMessage: string
        ) => {
            this.latitudeSignal.set(latitude);
            this.longitudeSignal.set(longitude);
            this.locationMessageSignal.set(userFacingMessage);
            this.reloadNearbyBarbershops();
        };

        if (!navigator.geolocation) {
            initializeDiscoveryWithCoordinates(
                ClientDiscoveryPageComponent.referenceRegionLatitudeForDiscoveryFallback,
                ClientDiscoveryPageComponent.referenceRegionLongitudeForDiscoveryFallback,
                'Geolocalizacao indisponivel. Mostrando resultados na regiao de referencia (Sao Paulo).'
            );
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                initializeDiscoveryWithCoordinates(
                    position.coords.latitude,
                    position.coords.longitude,
                    'Mostrando barbearias proximas a sua localizacao.'
                );
            },
            () => {
                initializeDiscoveryWithCoordinates(
                    ClientDiscoveryPageComponent.referenceRegionLatitudeForDiscoveryFallback,
                    ClientDiscoveryPageComponent.referenceRegionLongitudeForDiscoveryFallback,
                    'Nao foi possivel obter a localizacao. Usando regiao de referencia (Sao Paulo).'
                );
            }
        );
    }

    protected reloadNearbyBarbershops(): void {
        const latitude = this.latitudeSignal();
        const longitude = this.longitudeSignal();

        if (latitude === null || longitude === null) {
            return;
        }

        this.nearbyDiscoveryLoadingSignal.set(true);
        this.nearbyDiscoveryErrorMessageSignal.set(null);
        this.nearbyDiscoveryRequestFinishedSignal.set(false);

        this.barbershopSaasPublicHttpService
            .listNearbyBarbershopsForClientDiscovery({
                latitude,
                longitude,
                radiusInMeters: 50000,
                searchQuery: this.searchQuerySignal().trim() || undefined,
            })
            .subscribe({
                next: (barbershops) => {
                    this.barbershopsSignal.set(barbershops);
                    this.nearbyDiscoveryLoadingSignal.set(false);
                    this.nearbyDiscoveryRequestFinishedSignal.set(true);
                },
                error: (httpError: unknown) => {
                    this.nearbyDiscoveryLoadingSignal.set(false);
                    this.nearbyDiscoveryRequestFinishedSignal.set(true);
                    this.barbershopsSignal.set([]);
                    this.nearbyDiscoveryErrorMessageSignal.set(
                        this.resolveUserFriendlyHttpErrorMessage(
                            httpError,
                            'Nao foi possivel carregar as barbearias. Verifique se o backend esta no ar.'
                        )
                    );
                },
            });
    }

    protected onSearchSubmit(): void {
        this.reloadNearbyBarbershops();
    }

    protected openServicesDialog(barbershopTenantId: string): void {
        this.servicesDialogErrorMessageSignal.set(null);
        this.servicesDialogLoadingSignal.set(true);
        this.servicesDialogVisibleSignal.set(true);
        this.servicesForSelectedSignal.set([]);

        this.barbershopSaasPublicHttpService
            .listPublicServiceOfferingsForBarbershop(barbershopTenantId)
            .subscribe({
                next: (services) => {
                    this.servicesForSelectedSignal.set(services);
                    this.servicesDialogLoadingSignal.set(false);
                },
                error: (httpError: unknown) => {
                    this.servicesDialogLoadingSignal.set(false);
                    this.servicesDialogErrorMessageSignal.set(
                        this.resolveUserFriendlyHttpErrorMessage(
                            httpError,
                            'Nao foi possivel carregar os servicos.'
                        )
                    );
                },
            });
    }

    protected openWhatsappContact(shop: BarbershopDiscoveryCardInterface): void {
        const rawWhatsapp = shop.whatsappContact?.replace(/\D/g, '') ?? '';

        if (!rawWhatsapp) {
            window.alert(
                'Esta barbearia ainda nao informou WhatsApp no cadastro. Tente outro canal de contato.'
            );
            return;
        }

        const whatsappUrl = `https://wa.me/55${rawWhatsapp}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    private resolveUserFriendlyHttpErrorMessage(
        httpError: unknown,
        fallbackMessage: string
    ): string {
        const errorPayload = httpError as {
            error?: { userFriendlyMessage?: string };
        };

        return errorPayload.error?.userFriendlyMessage ?? fallbackMessage;
    }
}
