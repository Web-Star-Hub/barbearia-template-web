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
import { AnonymousClientLeadSessionService } from '../../../core/services/anonymous-client-lead-session.service';
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
    private readonly anonymousClientLeadSessionService = inject(
        AnonymousClientLeadSessionService
    );

    protected readonly barbershopsSignal = signal<BarbershopDiscoveryCardInterface[]>([]);
    protected readonly nearbyDiscoveryRequestFinishedSignal = signal(false);
    protected readonly locationMessageSignal = signal<string>(
        'Preparando a busca por barbearias...'
    );
    protected readonly searchQuerySignal = signal('');
    protected readonly latitudeSignal = signal<number | null>(null);
    protected readonly longitudeSignal = signal<number | null>(null);

    protected readonly contactDialogVisibleSignal = signal(false);
    protected readonly selectedBarbershopIdSignal = signal<string | null>(null);
    protected readonly contactContextBarbershopIdSignal = signal<string | null>(null);
    protected readonly clientDisplayNameInputSignal = signal('');
    protected readonly clientWhatsappInputSignal = signal('');
    protected readonly revealedWhatsappSignal = signal<string | null>(null);

    protected readonly servicesDialogVisibleSignal = signal(false);
    protected readonly servicesForSelectedSignal = signal<
        BarbershopServiceOfferingInterface[]
    >([]);

    public ngOnInit(): void {
        const storedName =
            this.anonymousClientLeadSessionService.getStoredClientDisplayName();
        const storedWhatsapp =
            this.anonymousClientLeadSessionService.getStoredClientWhatsappNumber();
        if (storedName) {
            this.clientDisplayNameInputSignal.set(storedName);
        }
        if (storedWhatsapp) {
            this.clientWhatsappInputSignal.set(storedWhatsapp);
        }

        const loadWithReferenceRegion = (userFacingLocationMessage: string) => {
            this.latitudeSignal.set(
                ClientDiscoveryPageComponent.referenceRegionLatitudeForDiscoveryFallback
            );
            this.longitudeSignal.set(
                ClientDiscoveryPageComponent.referenceRegionLongitudeForDiscoveryFallback
            );
            this.locationMessageSignal.set(userFacingLocationMessage);
            this.reloadNearbyBarbershops();
        };

        if (!navigator.geolocation) {
            loadWithReferenceRegion(
                'Geolocalizacao indisponivel neste navegador. Mostrando resultados na regiao de referencia (Sao Paulo).'
            );
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.latitudeSignal.set(position.coords.latitude);
                this.longitudeSignal.set(position.coords.longitude);
                this.locationMessageSignal.set('Mostrando barbearias proximas a voce.');
                this.reloadNearbyBarbershops();
            },
            () => {
                loadWithReferenceRegion(
                    'Nao foi possivel obter a localizacao. Mostrando resultados na regiao de referencia (Sao Paulo); permita o acesso para ver unidades mais proximas.'
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
        this.barbershopSaasPublicHttpService
            .listNearbyBarbershopsForClientDiscovery({
                latitude,
                longitude,
                radiusInMeters: 25000,
                searchQuery: this.searchQuerySignal() || undefined,
            })
            .subscribe({
                next: (items) => {
                    this.barbershopsSignal.set(items);
                    this.nearbyDiscoveryRequestFinishedSignal.set(true);
                },
                error: () => {
                    this.barbershopsSignal.set([]);
                    this.nearbyDiscoveryRequestFinishedSignal.set(true);
                },
            });
    }

    protected onSearchSubmit(): void {
        this.reloadNearbyBarbershops();
    }

    protected openContactFlow(barbershopTenantId: string): void {
        this.selectedBarbershopIdSignal.set(barbershopTenantId);
        this.contactContextBarbershopIdSignal.set(barbershopTenantId);
        this.revealedWhatsappSignal.set(null);
        const existingToken =
            this.anonymousClientLeadSessionService.getLeadAccessTokenForBarbershop(
                barbershopTenantId
            );
        if (existingToken) {
            this.fetchWhatsappWithToken(barbershopTenantId, existingToken);
            return;
        }
        this.contactDialogVisibleSignal.set(true);
    }

    protected submitLeadAndRevealWhatsapp(): void {
        const barbershopTenantId = this.selectedBarbershopIdSignal();
        if (!barbershopTenantId) {
            return;
        }
        const clientDisplayName = this.clientDisplayNameInputSignal().trim();
        const clientWhatsappNumber = this.clientWhatsappInputSignal().trim();
        if (clientDisplayName.length < 2 || clientWhatsappNumber.length < 10) {
            return;
        }
        this.anonymousClientLeadSessionService.saveClientDisplayProfile(
            clientDisplayName,
            clientWhatsappNumber
        );
        this.barbershopSaasPublicHttpService
            .registerAnonymousClientLead({
                barbershopTenantId,
                clientDisplayName,
                clientWhatsappNumber,
            })
            .subscribe({
                next: (result) => {
                    this.anonymousClientLeadSessionService.saveLeadAccessTokenForBarbershop(
                        barbershopTenantId,
                        result.leadAccessToken
                    );
                    this.contactDialogVisibleSignal.set(false);
                    this.fetchWhatsappWithToken(
                        barbershopTenantId,
                        result.leadAccessToken
                    );
                },
            });
    }

    private fetchWhatsappWithToken(
        barbershopTenantId: string,
        leadAccessToken: string
    ): void {
        this.barbershopSaasPublicHttpService
            .getWhatsappContactForVerifiedLead(barbershopTenantId, leadAccessToken)
            .subscribe({
                next: (result) => this.revealedWhatsappSignal.set(result.whatsappContact),
            });
    }

    protected openServicesDialog(barbershopTenantId: string): void {
        this.selectedBarbershopIdSignal.set(barbershopTenantId);
        this.barbershopSaasPublicHttpService
            .listPublicServiceOfferingsForBarbershop(barbershopTenantId)
            .subscribe({
                next: (services) => {
                    this.servicesForSelectedSignal.set(services);
                    this.servicesDialogVisibleSignal.set(true);
                },
            });
    }
}
