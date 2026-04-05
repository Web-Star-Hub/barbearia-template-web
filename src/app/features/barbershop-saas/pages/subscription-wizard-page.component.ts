import { KeyValuePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { BarbershopSaasPublicHttpService } from '../services/barbershop-saas-public-http.service';
import { SubscriptionPlanDefinitionInterface } from '../../../core/models/barbershop-saas.models';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';

interface WizardServiceDraft {
    serviceName: string;
    priceInReais: number;
    averageDurationInMinutes: number;
}

interface WizardProfessionalDraft {
    fullName: string;
    profileImageUrl: string;
    phoneNumber: string;
    emailAddress: string;
    serviceOfferingDraftIndexes: number[];
    isBarbershopAdministrator: boolean;
}

@Component({
    selector: 'app-subscription-wizard-page',
    imports: [
        RouterLink,
        FormsModule,
        Button,
        Card,
        Checkbox,
        Dialog,
        InputNumber,
        InputText,
        KeyValuePipe,
        CurrencyBrlPipe,
    ],
    templateUrl: './subscription-wizard-page.component.html',
    styleUrl: './subscription-wizard-page.component.scss',
})
export class SubscriptionWizardPageComponent implements OnInit {
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly barbershopSaasPublicHttpService = inject(
        BarbershopSaasPublicHttpService
    );

    protected readonly activeStepIndexSignal = signal(0);
    protected readonly selectedPlanSignal =
        signal<SubscriptionPlanDefinitionInterface | null>(null);
    protected readonly subscriptionPlanCatalogSignal = signal<
        SubscriptionPlanDefinitionInterface[]
    >([]);
    protected readonly isAwaitingUserSubscriptionPlanChoiceSignal = signal(false);
    protected readonly subscriptionPlanCatalogRequestFailedSignal = signal(false);
    protected readonly invalidPlanFromQueryMessageSignal = signal<string | null>(null);
    protected readonly completionDialogVisibleSignal = signal(false);
    protected readonly generatedPasswordsSignal = signal<Record<string, string>>({});
    protected readonly wizardProfileImageUploadInProgressSignal = signal(false);
    protected readonly wizardProfileImageUploadErrorMessageSignal = signal<string | null>(
        null
    );

    protected tradingNameInput = '';
    protected profileImageUrlInput =
        'https://placehold.co/400x300/1a1a1a/fff?text=Barbearia';
    protected whatsappContactInput = '';
    protected emailContactInput = '';
    protected taxIdentificationInput = '';
    protected formattedAddressInput = '';
    protected latitudeInput = -23.561684;
    protected longitudeInput = -46.655981;
    protected opensOnPublicHolidaysModel = false;

    protected readonly defaultOpeningHours: Record<
        string,
        { opensAt: string; closesAt: string }[]
    > = {
        '0': [],
        '1': [{ opensAt: '09:00', closesAt: '18:00' }],
        '2': [{ opensAt: '09:00', closesAt: '18:00' }],
        '3': [{ opensAt: '09:00', closesAt: '18:00' }],
        '4': [{ opensAt: '09:00', closesAt: '18:00' }],
        '5': [{ opensAt: '09:00', closesAt: '18:00' }],
        '6': [{ opensAt: '09:00', closesAt: '14:00' }],
    };

    protected serviceDraftsSignal = signal<WizardServiceDraft[]>([
        {
            serviceName: 'Corte masculino',
            priceInReais: 40,
            averageDurationInMinutes: 30,
        },
    ]);

    protected professionalDraftsSignal = signal<WizardProfessionalDraft[]>([
        {
            fullName: '',
            profileImageUrl: 'https://placehold.co/200x200/333/fff?text=Foto',
            phoneNumber: '',
            emailAddress: '',
            serviceOfferingDraftIndexes: [0],
            isBarbershopAdministrator: true,
        },
    ]);

    public ngOnInit(): void {
        const planIdFromQuery = this.activatedRoute.snapshot.queryParamMap.get(
            'subscriptionPlanDefinitionId'
        );
        this.barbershopSaasPublicHttpService.listSubscriptionPlanDefinitions().subscribe({
            next: (plans) => {
                this.subscriptionPlanCatalogSignal.set(plans);
                if (!planIdFromQuery) {
                    this.isAwaitingUserSubscriptionPlanChoiceSignal.set(true);
                    return;
                }
                const matchedPlan =
                    plans.find((plan) => plan.id === planIdFromQuery) ?? null;
                if (matchedPlan) {
                    this.selectedPlanSignal.set(matchedPlan);
                    this.isAwaitingUserSubscriptionPlanChoiceSignal.set(false);
                    return;
                }
                this.invalidPlanFromQueryMessageSignal.set(
                    'O plano indicado na URL nao foi encontrado. Escolha um plano abaixo.'
                );
                this.isAwaitingUserSubscriptionPlanChoiceSignal.set(true);
            },
            error: () => {
                this.subscriptionPlanCatalogRequestFailedSignal.set(true);
            },
        });
    }

    protected userSelectedSubscriptionPlanForWizard(
        selectedPlan: SubscriptionPlanDefinitionInterface
    ): void {
        this.selectedPlanSignal.set(selectedPlan);
        this.isAwaitingUserSubscriptionPlanChoiceSignal.set(false);
        this.invalidPlanFromQueryMessageSignal.set(null);
        void this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: { subscriptionPlanDefinitionId: selectedPlan.id },
            replaceUrl: true,
        });
    }

    protected isRecommendedSubscriptionPlanForWizard(
        plan: SubscriptionPlanDefinitionInterface
    ): boolean {
        return plan.planDisplayName === 'Equipe';
    }

    protected addServiceDraft(): void {
        this.serviceDraftsSignal.update((items) => [
            ...items,
            { serviceName: '', priceInReais: 0, averageDurationInMinutes: 30 },
        ]);
    }

    protected removeServiceDraft(index: number): void {
        this.serviceDraftsSignal.update((items) =>
            items.filter((_, itemIndex) => itemIndex !== index)
        );
    }

    protected addProfessionalDraft(): void {
        const plan = this.selectedPlanSignal();
        const current = this.professionalDraftsSignal();
        if (plan && current.length >= plan.maximumProfessionalsPerBarbershop) {
            return;
        }
        this.professionalDraftsSignal.update((items) => [
            ...items,
            {
                fullName: '',
                profileImageUrl: 'https://placehold.co/200x200/666/fff?text=Foto',
                phoneNumber: '',
                emailAddress: '',
                serviceOfferingDraftIndexes: [0],
                isBarbershopAdministrator: false,
            },
        ]);
    }

    protected removeProfessionalDraft(index: number): void {
        this.professionalDraftsSignal.update((items) =>
            items.filter((_, itemIndex) => itemIndex !== index)
        );
    }

    protected toggleProfessionalServiceIndex(
        professionalIndex: number,
        serviceIndex: number,
        checked: boolean
    ): void {
        this.professionalDraftsSignal.update((items) => {
            const next = [...items];
            const row = { ...next[professionalIndex] };
            const set = new Set(row.serviceOfferingDraftIndexes);
            if (checked) {
                set.add(serviceIndex);
            } else {
                set.delete(serviceIndex);
            }
            row.serviceOfferingDraftIndexes = [...set].sort(
                (aIndex, bIndex) => aIndex - bIndex
            );
            next[professionalIndex] = row;
            return next;
        });
    }

    protected setOnlyAdministrator(professionalIndex: number): void {
        this.professionalDraftsSignal.update((items) =>
            items.map((row, rowIndex) => ({
                ...row,
                isBarbershopAdministrator: rowIndex === professionalIndex,
            }))
        );
    }

    protected advanceStep(): void {
        this.activeStepIndexSignal.update((value) => Math.min(value + 1, 2));
    }

    protected goBackStep(): void {
        this.activeStepIndexSignal.update((value) => Math.max(value - 1, 0));
    }

    protected submitBarbershopProfileImageUploadFromFileInput(
        htmlInputElementChangeEvent: Event
    ): void {
        const htmlInputElement = htmlInputElementChangeEvent.target as HTMLInputElement;
        const selectedImageFile = htmlInputElement.files?.[0];
        htmlInputElement.value = '';
        if (selectedImageFile === undefined) {
            return;
        }
        this.wizardProfileImageUploadErrorMessageSignal.set(null);
        this.wizardProfileImageUploadInProgressSignal.set(true);
        this.barbershopSaasPublicHttpService
            .uploadPublicProfileImage(selectedImageFile)
            .subscribe({
                next: (uploadResult) => {
                    this.profileImageUrlInput = uploadResult.profileImageUrl;
                    this.wizardProfileImageUploadInProgressSignal.set(false);
                },
                error: (httpError) => {
                    this.wizardProfileImageUploadErrorMessageSignal.set(
                        this.resolveFriendlyProfileImageUploadErrorMessage(httpError)
                    );
                    this.wizardProfileImageUploadInProgressSignal.set(false);
                },
            });
    }

    protected submitProfessionalProfileImageUploadFromFileInput(
        professionalDraftRowIndex: number,
        htmlInputElementChangeEvent: Event
    ): void {
        const htmlInputElement = htmlInputElementChangeEvent.target as HTMLInputElement;
        const selectedImageFile = htmlInputElement.files?.[0];
        htmlInputElement.value = '';
        if (selectedImageFile === undefined) {
            return;
        }
        this.wizardProfileImageUploadErrorMessageSignal.set(null);
        this.wizardProfileImageUploadInProgressSignal.set(true);
        this.barbershopSaasPublicHttpService
            .uploadPublicProfileImage(selectedImageFile)
            .subscribe({
                next: (uploadResult) => {
                    this.professionalDraftsSignal.update((draftRows) => {
                        const nextDraftRows = [...draftRows];
                        const updatedRow = {
                            ...nextDraftRows[professionalDraftRowIndex],
                        };
                        updatedRow.profileImageUrl = uploadResult.profileImageUrl;
                        nextDraftRows[professionalDraftRowIndex] = updatedRow;
                        return nextDraftRows;
                    });
                    this.wizardProfileImageUploadInProgressSignal.set(false);
                },
                error: (httpError) => {
                    this.wizardProfileImageUploadErrorMessageSignal.set(
                        this.resolveFriendlyProfileImageUploadErrorMessage(httpError)
                    );
                    this.wizardProfileImageUploadInProgressSignal.set(false);
                },
            });
    }

    private resolveFriendlyProfileImageUploadErrorMessage(httpError: unknown): string {
        const errorPayload = httpError as {
            error?: { userFriendlyMessage?: string };
        };
        return (
            errorPayload.error?.userFriendlyMessage ??
            'Nao foi possivel enviar a imagem. Tente outro arquivo.'
        );
    }

    protected submitWizard(): void {
        const plan = this.selectedPlanSignal();
        if (!plan) {
            return;
        }
        const professionals = this.professionalDraftsSignal();
        const adminCount = professionals.filter(
            (row) => row.isBarbershopAdministrator
        ).length;
        if (adminCount !== 1) {
            return;
        }
        const payload = {
            subscriptionPlanDefinitionId: plan.id,
            barbershopProfile: {
                tradingName: this.tradingNameInput.trim(),
                profileImageUrl: this.profileImageUrlInput.trim(),
                whatsappContact: this.whatsappContactInput.trim(),
                emailContact: this.emailContactInput.trim() || undefined,
                taxIdentificationNumber: this.taxIdentificationInput.trim() || undefined,
                formattedAddress: this.formattedAddressInput.trim(),
                latitude: this.latitudeInput,
                longitude: this.longitudeInput,
                openingHoursByWeekday: this.defaultOpeningHours,
                opensOnPublicHolidays: this.opensOnPublicHolidaysModel,
                timezoneIdentifier: 'America/Sao_Paulo',
            },
            serviceOfferings: this.serviceDraftsSignal().map((row) => ({
                serviceName: row.serviceName.trim(),
                priceInCents: Math.round(row.priceInReais * 100),
                averageDurationInMinutes: row.averageDurationInMinutes,
            })),
            professionals: professionals.map((row) => ({
                fullName: row.fullName.trim(),
                profileImageUrl: row.profileImageUrl.trim(),
                phoneNumber: row.phoneNumber.trim(),
                emailAddress: row.emailAddress.trim() || undefined,
                serviceOfferingDraftIndexes: row.serviceOfferingDraftIndexes,
                isBarbershopAdministrator: row.isBarbershopAdministrator,
            })),
        };
        this.barbershopSaasPublicHttpService
            .completeBarbershopOnboarding(payload)
            .subscribe({
                next: (result) => {
                    this.generatedPasswordsSignal.set(
                        result.generatedPasswordsByProfessionalName
                    );
                    this.completionDialogVisibleSignal.set(true);
                },
            });
    }
}
