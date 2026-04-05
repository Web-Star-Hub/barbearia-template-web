import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Select } from 'primeng/select';
import { BarbershopSaasPublicHttpService } from '../services/barbershop-saas-public-http.service';
import { BarbershopProfessionalAuthenticationHttpService } from '../services/barbershop-professional-authentication-http.service';
import { BarbershopProfessionalSessionService } from '../../../core/services/barbershop-professional-session.service';
import { BarbershopLoginOptionInterface } from '../../../core/models/barbershop-saas.models';

@Component({
    selector: 'app-barbershop-professional-login-page',
    imports: [RouterLink, FormsModule, Button, InputText, Password, Select],
    templateUrl: './barbershop-professional-login-page.component.html',
    styleUrl: './barbershop-professional-login-page.component.scss',
})
export class BarbershopProfessionalLoginPageComponent implements OnInit {
    private static readonly referenceRegionLatitudeForLoginDirectory = -23.55052;
    private static readonly referenceRegionLongitudeForLoginDirectory = -46.633308;

    private readonly barbershopSaasPublicHttpService = inject(
        BarbershopSaasPublicHttpService
    );
    private readonly barbershopProfessionalAuthenticationHttpService = inject(
        BarbershopProfessionalAuthenticationHttpService
    );
    private readonly barbershopProfessionalSessionService = inject(
        BarbershopProfessionalSessionService
    );
    private readonly router = inject(Router);

    protected readonly loginOptionsSignal = signal<BarbershopLoginOptionInterface[]>([]);
    protected readonly locationMessageSignal = signal<string>(
        'Carregando barbearias da sua regiao...'
    );
    protected readonly errorMessageSignal = signal<string | null>(null);

    protected selectedBarbershopTenantId: string | null = null;
    protected loginIdentifierInput = '';
    protected passwordInput = '';
    protected professionalLoginDirectorySearchQueryInput = '';

    private latitudeUsedForProfessionalLoginDirectory: number | null = null;
    private longitudeUsedForProfessionalLoginDirectory: number | null = null;

    public ngOnInit(): void {
        if (this.barbershopProfessionalSessionService.isAuthenticated()) {
            void this.router.navigateByUrl('/barbearia/painel');
            return;
        }

        const initializeLoginDirectoryWithCoordinates = (
            latitude: number,
            longitude: number,
            userFacingMessage: string
        ) => {
            this.latitudeUsedForProfessionalLoginDirectory = latitude;
            this.longitudeUsedForProfessionalLoginDirectory = longitude;
            this.locationMessageSignal.set(userFacingMessage);
            this.loadProfessionalLoginDirectoryOptionsFromServer();
        };

        if (!navigator.geolocation) {
            initializeLoginDirectoryWithCoordinates(
                BarbershopProfessionalLoginPageComponent.referenceRegionLatitudeForLoginDirectory,
                BarbershopProfessionalLoginPageComponent.referenceRegionLongitudeForLoginDirectory,
                'Geolocalizacao indisponivel. Lista baseada na regiao de referencia (Sao Paulo); use a busca para filtrar.'
            );
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                initializeLoginDirectoryWithCoordinates(
                    position.coords.latitude,
                    position.coords.longitude,
                    'Selecione a barbearia e entre com seu acesso.'
                );
            },
            () => {
                initializeLoginDirectoryWithCoordinates(
                    BarbershopProfessionalLoginPageComponent.referenceRegionLatitudeForLoginDirectory,
                    BarbershopProfessionalLoginPageComponent.referenceRegionLongitudeForLoginDirectory,
                    'Nao foi possivel obter a localizacao. Usando regiao de referencia (Sao Paulo); use a busca para encontrar sua unidade.'
                );
            }
        );
    }

    protected submitProfessionalLoginDirectorySearch(): void {
        this.loadProfessionalLoginDirectoryOptionsFromServer();
    }

    private loadProfessionalLoginDirectoryOptionsFromServer(): void {
        const latitude = this.latitudeUsedForProfessionalLoginDirectory;
        const longitude = this.longitudeUsedForProfessionalLoginDirectory;
        if (latitude === null || longitude === null) {
            return;
        }
        this.barbershopSaasPublicHttpService
            .listNearbyBarbershopsForProfessionalLogin({
                latitude,
                longitude,
                radiusInMeters: 200000,
                searchQuery:
                    this.professionalLoginDirectorySearchQueryInput.trim() || undefined,
            })
            .subscribe({
                next: (options) => this.loginOptionsSignal.set(options),
                error: () => this.loginOptionsSignal.set([]),
            });
    }

    protected submitLogin(): void {
        this.errorMessageSignal.set(null);
        if (!this.selectedBarbershopTenantId) {
            this.errorMessageSignal.set('Selecione uma barbearia.');
            return;
        }
        this.barbershopProfessionalAuthenticationHttpService
            .loginBarbershopProfessional({
                barbershopTenantId: this.selectedBarbershopTenantId,
                loginIdentifier: this.loginIdentifierInput.trim(),
                password: this.passwordInput,
            })
            .subscribe({
                next: (result) => {
                    this.barbershopProfessionalSessionService.setSession(
                        result.accessToken,
                        result.professionalProfile
                    );
                    void this.router.navigateByUrl('/barbearia/painel');
                },
                error: (errorResponse: { error?: { userFriendlyMessage?: string } }) => {
                    const message =
                        errorResponse?.error?.userFriendlyMessage ??
                        'Nao foi possivel entrar. Verifique os dados.';
                    this.errorMessageSignal.set(message);
                },
            });
    }
}
