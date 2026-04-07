import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { BarbershopSaasPublicHttpService } from '../services/barbershop-saas-public-http.service';
import { BarbershopProfessionalAuthenticationHttpService } from '../services/barbershop-professional-authentication-http.service';
import { BarbershopProfessionalSessionService } from '../../../core/services/barbershop-professional-session.service';
import { BarbershopLoginOptionInterface } from '../../../core/models/barbershop-saas.models';

@Component({
    selector: 'app-barbershop-professional-login-page',
    imports: [RouterLink, FormsModule, Button, InputText, Password],
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
    protected readonly loginDirectoryLoadingSignal = signal(false);
    protected readonly locationMessageSignal = signal<string>(
        'Carregando barbearias da sua regiao...'
    );
    protected readonly errorMessageSignal = signal<string | null>(null);

    protected loginEmailInput = '';
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
                    'Unidades proximas (use o filtro por nome se necessario). Faca login com o e-mail e senha do proprietario.'
                );
            },
            () => {
                initializeLoginDirectoryWithCoordinates(
                    BarbershopProfessionalLoginPageComponent.referenceRegionLatitudeForLoginDirectory,
                    BarbershopProfessionalLoginPageComponent.referenceRegionLongitudeForLoginDirectory,
                    'Nao foi possivel obter a localizacao. Usando regiao de referencia (Sao Paulo).'
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

        this.loginDirectoryLoadingSignal.set(true);

        this.barbershopSaasPublicHttpService
            .listNearbyBarbershopsForProfessionalLogin({
                latitude,
                longitude,
                radiusInMeters: 200000,
                searchQuery:
                    this.professionalLoginDirectorySearchQueryInput.trim() || undefined,
            })
            .subscribe({
                next: (options) => {
                    this.loginOptionsSignal.set(options);
                    this.loginDirectoryLoadingSignal.set(false);
                },
                error: () => {
                    this.loginOptionsSignal.set([]);
                    this.loginDirectoryLoadingSignal.set(false);
                },
            });
    }

    protected submitLogin(): void {
        this.errorMessageSignal.set(null);

        const normalizedEmail = this.loginEmailInput.trim().toLowerCase();

        if (!normalizedEmail || this.passwordInput.length < 6) {
            this.errorMessageSignal.set(
                'Informe o e-mail do proprietario e a senha com pelo menos 6 caracteres.'
            );
            return;
        }

        this.barbershopProfessionalAuthenticationHttpService
            .loginBarbershopProfessionalWithEmailAndPassword({
                email: normalizedEmail,
                password: this.passwordInput,
            })
            .subscribe({
                next: (loginResult) => {
                    this.barbershopProfessionalSessionService.setSession(
                        loginResult.accessToken,
                        {
                            professionalId: loginResult.authenticatedUser.userAccountIdentifier,
                            barbershopTenantId:
                                loginResult.authenticatedUser.barbershopIdentifier,
                            fullName: loginResult.authenticatedUser.fullName,
                            isBarbershopAdministrator:
                                loginResult.authenticatedUser.role === 'owner',
                            phoneNumberNormalized: '',
                            emailAddressNormalized: loginResult.authenticatedUser.email,
                        }
                    );

                    void this.router.navigateByUrl('/barbearia/painel');
                },
                error: (httpError: unknown) => {
                    const errorPayload = httpError as {
                        error?: { userFriendlyMessage?: string };
                    };

                    this.errorMessageSignal.set(
                        errorPayload.error?.userFriendlyMessage ??
                            'Nao foi possivel entrar. Verifique e-mail e senha.'
                    );
                },
            });
    }
}
