import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { BarbershopProfessionalPanelHttpService } from '../services/barbershop-professional-panel-http.service';
import { BarbershopSaasPublicHttpService } from '../services/barbershop-saas-public-http.service';
import { BarbershopProfessionalSessionService } from '../../../core/services/barbershop-professional-session.service';
import {
    BarbershopProfessionalListItemInterface,
    BarbershopServiceOfferingInterface,
    BarbershopTenantProfileInterface,
} from '../../../core/models/barbershop-saas.models';

type PanelSection =
    | 'dashboard'
    | 'services'
    | 'professionals'
    | 'tenant'
    | 'subscription'
    | 'profile';

@Component({
    selector: 'app-barbershop-panel-shell',
    imports: [FormsModule, Button, Dialog, InputNumber, InputText, DecimalPipe],
    templateUrl: './barbershop-panel-shell.component.html',
    styleUrl: './barbershop-panel-shell.component.scss',
})
export class BarbershopPanelShellComponent implements OnInit {
    private readonly barbershopProfessionalPanelHttpService = inject(
        BarbershopProfessionalPanelHttpService
    );
    private readonly barbershopSaasPublicHttpService = inject(
        BarbershopSaasPublicHttpService
    );
    protected readonly barbershopProfessionalSessionService = inject(
        BarbershopProfessionalSessionService
    );
    private readonly router = inject(Router);

    protected readonly activeSectionSignal = signal<PanelSection>('dashboard');
    protected readonly dashboardSummarySignal = signal<{
        tradingName: string;
        subscriptionLifecycleStatus: string;
        trialEndsAt?: string;
        serviceOfferingCount: number;
        professionalCount: number;
    } | null>(null);
    protected readonly subscriptionSummarySignal = signal<{
        subscriptionLifecycleStatus: string;
        trialEndsAt?: string;
        planDisplayName: string;
        monthlyPriceInCents: number;
        yearlyPriceInCents: number;
        invoiceHistoryItems: Array<{
            issuedAt: string;
            amountInCents: number;
            description: string;
        }>;
    } | null>(null);
    protected readonly serviceOfferingsSignal = signal<
        BarbershopServiceOfferingInterface[]
    >([]);
    protected readonly professionalsSignal = signal<
        BarbershopProfessionalListItemInterface[]
    >([]);
    protected readonly tenantProfileSignal =
        signal<BarbershopTenantProfileInterface | null>(null);

    protected newServiceName = '';
    protected newServicePriceReais = 0;
    protected newServiceMinutes = 30;

    protected newProfessionalName = '';
    protected newProfessionalImageUrl = 'https://placehold.co/200x200/333/fff?text=Novo';
    protected newProfessionalPhone = '';
    protected newProfessionalEmail = '';
    protected newProfessionalServiceIds: string[] = [];
    protected newProfessionalIsAdministrator = false;

    protected passwordRevealSignal = signal<string | null>(null);
    protected passwordDialogVisibleSignal = signal(false);
    protected readonly panelProfileImageUploadInProgressSignal = signal(false);
    protected readonly panelProfileImageUploadErrorMessageSignal = signal<string | null>(
        null
    );

    protected profileFullName = '';
    protected profileImageUrl = '';
    protected profilePhone = '';
    protected profileEmail = '';

    protected tenantDraftTradingName = '';
    protected tenantDraftProfileImageUrl = '';
    protected tenantDraftWhatsappContact = '';
    protected tenantDraftEmailContact = '';
    protected tenantDraftTaxIdentificationNumber = '';
    protected tenantDraftFormattedAddress = '';
    protected tenantDraftLatitude = 0;
    protected tenantDraftLongitude = 0;
    protected tenantDraftOpensOnPublicHolidays = false;
    protected tenantDraftTimezoneIdentifier = 'America/Sao_Paulo';
    protected tenantDraftOpeningHoursJson = '';

    public ngOnInit(): void {
        this.reloadDashboard();
        this.reloadSubscriptionSummary();
        const profile = this.barbershopProfessionalSessionService.professionalProfile();
        if (profile) {
            this.profileFullName = profile.fullName;
            this.profileImageUrl = '';
            this.profilePhone = profile.phoneNumberNormalized;
            this.profileEmail = profile.emailAddressNormalized ?? '';
        }
    }

    protected selectSection(section: PanelSection): void {
        this.panelProfileImageUploadErrorMessageSignal.set(null);
        this.activeSectionSignal.set(section);
        if (section === 'services') {
            this.reloadServices();
        }
        if (section === 'professionals') {
            this.reloadProfessionals();
            if (this.isAdministrator()) {
                this.reloadServices();
            }
        }
        if (section === 'tenant') {
            this.reloadTenantProfile();
        }
        if (section === 'profile') {
            this.refreshOwnProfessionalProfileImageUrlFromServer();
        }
    }

    protected reloadDashboard(): void {
        this.barbershopProfessionalPanelHttpService.getDashboardSummary().subscribe({
            next: (summary) => this.dashboardSummarySignal.set(summary),
        });
    }

    protected reloadSubscriptionSummary(): void {
        this.barbershopProfessionalPanelHttpService.getSubscriptionSummary().subscribe({
            next: (summary) => this.subscriptionSummarySignal.set(summary),
        });
    }

    protected reloadServices(): void {
        this.barbershopProfessionalPanelHttpService.listServiceOfferings().subscribe({
            next: (items) => this.serviceOfferingsSignal.set(items),
        });
    }

    protected reloadProfessionals(): void {
        this.barbershopProfessionalPanelHttpService.listProfessionals().subscribe({
            next: (items) => this.professionalsSignal.set(items),
        });
    }

    protected reloadTenantProfile(): void {
        this.barbershopProfessionalPanelHttpService
            .getBarbershopTenantProfile()
            .subscribe({
                next: (tenant) => {
                    this.tenantProfileSignal.set(tenant);
                    if (tenant) {
                        this.tenantDraftTradingName = tenant.tradingName;
                        this.tenantDraftProfileImageUrl = tenant.profileImageUrl;
                        this.tenantDraftWhatsappContact = tenant.whatsappContact;
                        this.tenantDraftEmailContact = tenant.emailContact ?? '';
                        this.tenantDraftTaxIdentificationNumber =
                            tenant.taxIdentificationNumber ?? '';
                        this.tenantDraftFormattedAddress = tenant.formattedAddress;
                        this.tenantDraftLatitude = tenant.latitude;
                        this.tenantDraftLongitude = tenant.longitude;
                        this.tenantDraftOpensOnPublicHolidays =
                            tenant.opensOnPublicHolidays;
                        this.tenantDraftTimezoneIdentifier = tenant.timezoneIdentifier;
                        this.tenantDraftOpeningHoursJson = JSON.stringify(
                            tenant.openingHoursByWeekday,
                            null,
                            2
                        );
                    }
                },
            });
    }

    protected logout(): void {
        this.barbershopProfessionalSessionService.clearSession();
        void this.router.navigateByUrl('/barbearia');
    }

    protected isAdministrator(): boolean {
        return (
            this.barbershopProfessionalSessionService.professionalProfile()
                ?.isBarbershopAdministrator ?? false
        );
    }

    protected currentProfessionalId(): string | null {
        return (
            this.barbershopProfessionalSessionService.professionalProfile()
                ?.professionalId ?? null
        );
    }

    protected createService(): void {
        if (!this.newServiceName.trim()) {
            return;
        }
        this.barbershopProfessionalPanelHttpService
            .createServiceOffering({
                serviceName: this.newServiceName.trim(),
                priceInCents: Math.round(this.newServicePriceReais * 100),
                averageDurationInMinutes: this.newServiceMinutes,
            })
            .subscribe({
                next: () => {
                    this.newServiceName = '';
                    this.newServicePriceReais = 0;
                    this.reloadServices();
                    this.reloadDashboard();
                },
            });
    }

    protected deleteService(serviceOfferingId: string): void {
        this.barbershopProfessionalPanelHttpService
            .deleteServiceOffering(serviceOfferingId)
            .subscribe({
                next: () => {
                    this.reloadServices();
                    this.reloadDashboard();
                },
            });
    }

    protected regeneratePassword(professionalId: string): void {
        this.barbershopProfessionalPanelHttpService
            .regenerateProfessionalPassword(professionalId)
            .subscribe({
                next: (result) => {
                    this.passwordRevealSignal.set(result.newPlainPassword);
                    this.passwordDialogVisibleSignal.set(true);
                },
            });
    }

    protected createProfessional(): void {
        if (
            !this.newProfessionalName.trim() ||
            !this.newProfessionalPhone.trim() ||
            this.newProfessionalServiceIds.length === 0
        ) {
            return;
        }
        this.barbershopProfessionalPanelHttpService
            .createProfessional({
                fullName: this.newProfessionalName.trim(),
                profileImageUrl: this.newProfessionalImageUrl.trim(),
                phoneNumber: this.newProfessionalPhone.trim(),
                emailAddress: this.newProfessionalEmail.trim() || undefined,
                barbershopServiceOfferingIds: this.newProfessionalServiceIds,
                isBarbershopAdministrator: this.newProfessionalIsAdministrator,
            })
            .subscribe({
                next: (result) => {
                    this.passwordRevealSignal.set(result.generatedPlainPassword);
                    this.passwordDialogVisibleSignal.set(true);
                    this.newProfessionalName = '';
                    this.newProfessionalPhone = '';
                    this.newProfessionalEmail = '';
                    this.newProfessionalServiceIds = [];
                    this.newProfessionalIsAdministrator = false;
                    this.reloadProfessionals();
                    this.reloadDashboard();
                },
            });
    }

    protected setPrimaryAdministrator(professionalId: string): void {
        this.barbershopProfessionalPanelHttpService
            .setPrimaryAdministrator(professionalId)
            .subscribe({
                next: () => this.reloadProfessionals(),
            });
    }

    protected saveTenantDraft(): void {
        let openingHoursByWeekday: Record<
            string,
            { opensAt: string; closesAt: string }[]
        > = {};
        try {
            openingHoursByWeekday = JSON.parse(
                this.tenantDraftOpeningHoursJson
            ) as Record<string, { opensAt: string; closesAt: string }[]>;
        } catch {
            return;
        }
        this.barbershopProfessionalPanelHttpService
            .updateBarbershopTenantProfile({
                tradingName: this.tenantDraftTradingName.trim(),
                profileImageUrl: this.tenantDraftProfileImageUrl.trim(),
                whatsappContact: this.tenantDraftWhatsappContact.trim(),
                emailContact: this.tenantDraftEmailContact.trim() || undefined,
                taxIdentificationNumber:
                    this.tenantDraftTaxIdentificationNumber.trim() || undefined,
                formattedAddress: this.tenantDraftFormattedAddress.trim(),
                latitude: this.tenantDraftLatitude,
                longitude: this.tenantDraftLongitude,
                openingHoursByWeekday,
                opensOnPublicHolidays: this.tenantDraftOpensOnPublicHolidays,
                timezoneIdentifier: this.tenantDraftTimezoneIdentifier.trim(),
            })
            .subscribe({
                next: (updated) => {
                    this.tenantProfileSignal.set(updated);
                    this.reloadDashboard();
                },
            });
    }

    protected saveOwnProfile(): void {
        const professionalId = this.currentProfessionalId();
        if (!professionalId) {
            return;
        }
        const accessToken = this.barbershopProfessionalSessionService.getAccessToken();
        this.barbershopProfessionalPanelHttpService
            .updateProfessionalProfile(professionalId, {
                fullName: this.profileFullName.trim(),
                profileImageUrl: this.profileImageUrl.trim() || undefined,
                phoneNumber: this.profilePhone.trim(),
                emailAddress: this.profileEmail.trim() || undefined,
            })
            .subscribe({
                next: (updated) => {
                    const session =
                        this.barbershopProfessionalSessionService.professionalProfile();
                    if (session && accessToken) {
                        this.barbershopProfessionalSessionService.setSession(
                            accessToken,
                            {
                                professionalId: session.professionalId,
                                barbershopTenantId: session.barbershopTenantId,
                                fullName: updated.fullName,
                                isBarbershopAdministrator:
                                    session.isBarbershopAdministrator,
                                phoneNumberNormalized: updated.phoneNumberNormalized,
                                emailAddressNormalized: updated.emailAddressNormalized,
                            }
                        );
                    }
                },
            });
    }

    protected toggleNewProfessionalService(serviceId: string, checked: boolean): void {
        const set = new Set(this.newProfessionalServiceIds);
        if (checked) {
            set.add(serviceId);
        } else {
            set.delete(serviceId);
        }
        this.newProfessionalServiceIds = [...set];
    }

    protected submitTenantProfileImageUploadFromFileInput(
        htmlInputElementChangeEvent: Event
    ): void {
        this.runPanelProfileImageUploadAndApplyToTargetField(
            htmlInputElementChangeEvent,
            (profileImageUrl) => {
                this.tenantDraftProfileImageUrl = profileImageUrl;
            }
        );
    }

    protected submitNewProfessionalProfileImageUploadFromFileInput(
        htmlInputElementChangeEvent: Event
    ): void {
        this.runPanelProfileImageUploadAndApplyToTargetField(
            htmlInputElementChangeEvent,
            (profileImageUrl) => {
                this.newProfessionalImageUrl = profileImageUrl;
            }
        );
    }

    protected submitOwnProfessionalProfileImageUploadFromFileInput(
        htmlInputElementChangeEvent: Event
    ): void {
        this.runPanelProfileImageUploadAndApplyToTargetField(
            htmlInputElementChangeEvent,
            (profileImageUrl) => {
                this.profileImageUrl = profileImageUrl;
            }
        );
    }

    private refreshOwnProfessionalProfileImageUrlFromServer(): void {
        const currentProfessionalId = this.currentProfessionalId();
        if (currentProfessionalId === null) {
            return;
        }
        this.barbershopProfessionalPanelHttpService.listProfessionals().subscribe({
            next: (professionals) => {
                const matchingProfessional = professionals.find(
                    (row) => row.professionalId === currentProfessionalId
                );
                if (matchingProfessional !== undefined) {
                    this.profileImageUrl = matchingProfessional.profileImageUrl;
                }
            },
        });
    }

    private runPanelProfileImageUploadAndApplyToTargetField(
        htmlInputElementChangeEvent: Event,
        applyProfileImageUrlToTargetField: (profileImageUrl: string) => void
    ): void {
        const htmlInputElement = htmlInputElementChangeEvent.target as HTMLInputElement;
        const selectedImageFile = htmlInputElement.files?.[0];
        htmlInputElement.value = '';
        if (selectedImageFile === undefined) {
            return;
        }
        this.panelProfileImageUploadErrorMessageSignal.set(null);
        this.panelProfileImageUploadInProgressSignal.set(true);
        this.barbershopSaasPublicHttpService
            .uploadPublicProfileImage(selectedImageFile)
            .subscribe({
                next: (uploadResult) => {
                    applyProfileImageUrlToTargetField(uploadResult.profileImageUrl);
                    this.panelProfileImageUploadInProgressSignal.set(false);
                },
                error: (httpError) => {
                    this.panelProfileImageUploadErrorMessageSignal.set(
                        this.resolveFriendlyPanelProfileImageUploadErrorMessage(httpError)
                    );
                    this.panelProfileImageUploadInProgressSignal.set(false);
                },
            });
    }

    private resolveFriendlyPanelProfileImageUploadErrorMessage(
        httpError: unknown
    ): string {
        const errorPayload = httpError as {
            error?: { userFriendlyMessage?: string };
        };
        return (
            errorPayload.error?.userFriendlyMessage ??
            'Nao foi possivel enviar a imagem. Tente outro arquivo.'
        );
    }
}
