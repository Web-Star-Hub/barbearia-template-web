import {
    Component,
    OnInit,
    AfterViewInit,
    ViewChild,
    ElementRef,
    inject,
    signal,
} from '@angular/core';
import { KeyValuePipe } from '@angular/common';
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

declare const google: any;

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
        CurrencyBrlPipe,
        KeyValuePipe,
    ],
    templateUrl: './subscription-wizard-page.component.html',
    styleUrl: './subscription-wizard-page.component.scss',
})
export class SubscriptionWizardPageComponent implements OnInit, AfterViewInit {
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly barbershopSaasPublicHttpService = inject(
        BarbershopSaasPublicHttpService
    );

    @ViewChild('addressInput') addressInput!: ElementRef;

    protected readonly activeStepIndexSignal = signal(0);
    protected readonly selectedPlanSignal =
        signal<SubscriptionPlanDefinitionInterface | null>(null);
    protected readonly subscriptionPlanCatalogSignal = signal<
        SubscriptionPlanDefinitionInterface[]
    >([]);
    protected readonly plansCatalogLoadingSignal = signal(false);
    protected readonly isAwaitingUserSubscriptionPlanChoiceSignal = signal(false);
    protected readonly subscriptionPlanCatalogRequestFailedSignal = signal(false);
    protected readonly invalidPlanFromQueryMessageSignal = signal<string | null>(null);
    protected readonly completionDialogVisibleSignal = signal(false);
    protected readonly completionSummaryMessageSignal = signal<string | null>(null);
    protected readonly registrationSubmittingSignal = signal(false);
    protected readonly registrationErrorMessageSignal = signal<string | null>(null);
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
    protected cityNameInput = 'Sao Paulo';
    protected stateCodeInput = 'SP';
    protected ownerPasswordInput = '';
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
    protected workingDaysInput: string[] = ['1', '2', '3', '4', '5', '6'];
    protected openingTimeInput = '09:00';
    protected closingTimeInput = '18:00';

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

        this.plansCatalogLoadingSignal.set(true);

        const mockPlans: SubscriptionPlanDefinitionInterface[] = [
            {
                id: 'essencial',
                planDisplayName: 'Essencial',
                planMarketingDescription: 'Ideal para quem esta comecando.',
                monthlyPriceInCents: 2900,
                yearlyPriceInCents: 29000,
                maximumProfessionalsPerBarbershop: 1,
                includedFeatureLabels: [
                    'Cadastro da barbearia',
                    'Cadastro de servicos',
                    '1 profissional',
                ],
                isActiveForNewSubscriptions: true,
            },
            {
                id: 'equipe',
                planDisplayName: 'Equipe',
                planMarketingDescription: 'Perfeito para pequenas equipes.',
                monthlyPriceInCents: 5900,
                yearlyPriceInCents: 59000,
                maximumProfessionalsPerBarbershop: 3,
                includedFeatureLabels: [
                    'Cadastro da barbearia',
                    'Cadastro de servicos',
                    'Ate 3 profissionais',
                ],
                isActiveForNewSubscriptions: true,
            },
            {
                id: 'crescimento',
                planDisplayName: 'Crescimento',
                planMarketingDescription: 'Para barbearias em expansao.',
                monthlyPriceInCents: 9900,
                yearlyPriceInCents: 99000,
                maximumProfessionalsPerBarbershop: 6,
                includedFeatureLabels: [
                    'Cadastro da barbearia',
                    'Cadastro de servicos',
                    'Ate 6 profissionais',
                ],
                isActiveForNewSubscriptions: true,
            },
        ];

        this.subscriptionPlanCatalogSignal.set(mockPlans);
        this.subscriptionPlanCatalogRequestFailedSignal.set(false);
        this.plansCatalogLoadingSignal.set(false);

        if (!planIdFromQuery) {
            this.isAwaitingUserSubscriptionPlanChoiceSignal.set(true);
            return;
        }

        const matchedPlan = mockPlans.find((plan) => plan.id === planIdFromQuery) ?? null;

        if (matchedPlan) {
            this.selectedPlanSignal.set(matchedPlan);
            this.isAwaitingUserSubscriptionPlanChoiceSignal.set(false);
            return;
        }

        this.invalidPlanFromQueryMessageSignal.set(
            'O plano indicado na URL nao foi encontrado. Escolha um plano abaixo.'
        );
        this.isAwaitingUserSubscriptionPlanChoiceSignal.set(true);
    }

    public ngAfterViewInit(): void {
        const waitForGoogle = setInterval(() => {
            if ((window as any).google && this.addressInput) {
                clearInterval(waitForGoogle);

                const autocomplete = new (window as any).google.maps.places.Autocomplete(
                    this.addressInput.nativeElement
                );

                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();

                    if (!place?.geometry?.location) {
                        return;
                    }

                    this.formattedAddressInput = place.formatted_address ?? '';
                    this.latitudeInput = place.geometry.location.lat();
                    this.longitudeInput = place.geometry.location.lng();
                });
            }
        }, 300);
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
        this.registrationErrorMessageSignal.set(null);

        const plan = this.selectedPlanSignal();
        const current = this.professionalDraftsSignal();

        if (plan && current.length >= plan.maximumProfessionalsPerBarbershop) {
            this.registrationErrorMessageSignal.set(
                'Limite de profissionais do plano atingido.'
            );
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
    protected buildOpeningHoursByWeekday(): Record<
        string,
        { opensAt: string; closesAt: string }[]
    > {
        const openingHours: Record<string, { opensAt: string; closesAt: string }[]> = {
            '0': [],
            '1': [],
            '2': [],
            '3': [],
            '4': [],
            '5': [],
            '6': [],
        };

        for (const weekday of this.workingDaysInput) {
            openingHours[weekday] = [
                {
                    opensAt: this.openingTimeInput,
                    closesAt: this.closingTimeInput,
                },
            ];
        }

        return openingHours;
    }
    protected submitWizard(): void {
        this.registrationErrorMessageSignal.set(null);

        const plan = this.selectedPlanSignal();

        if (!plan) {
            return;
        }

        const professionals = this.professionalDraftsSignal();
        const adminCount = professionals.filter(
            (row) => row.isBarbershopAdministrator
        ).length;

        if (adminCount !== 1) {
            this.registrationErrorMessageSignal.set(
                'Defina exatamente um administrador na equipe.'
            );
            return;
        }

        if (!this.tradingNameInput.trim()) {
            this.registrationErrorMessageSignal.set('Informe o nome da barbearia.');
            return;
        }

        if (!this.cityNameInput.trim() || this.stateCodeInput.trim().length !== 2) {
            this.registrationErrorMessageSignal.set(
                'Informe cidade e UF com dois caracteres.'
            );
            return;
        }

        if (!this.ownerPasswordInput || this.ownerPasswordInput.length < 6) {
            this.registrationErrorMessageSignal.set(
                'A senha do proprietario deve ter pelo menos 6 caracteres.'
            );
            return;
        }

        this.registrationSubmittingSignal.set(true);

        const payload = {
            subscriptionPlanDefinitionId: plan.id,
            barbershopProfile: {
                tradingName: this.tradingNameInput.trim(),
                profileImageUrl: this.profileImageUrlInput.trim(),
                whatsappContact: this.whatsappContactInput.trim(),
                emailContact: this.emailContactInput.trim() || undefined,
                taxIdentificationNumber: this.taxIdentificationInput.trim() || undefined,
                formattedAddress: this.formattedAddressInput.trim(),
                cityName: this.cityNameInput.trim(),
                stateCode: this.stateCodeInput.trim().toUpperCase(),
                latitude: this.latitudeInput,
                longitude: this.longitudeInput,
                ownerPassword: this.ownerPasswordInput,
                openingHoursByWeekday: this.buildOpeningHoursByWeekday(),
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

        console.log('Cadastro simulado:', payload);

        const generatedPasswords: Record<string, string> = {};

        professionals.forEach((professional) => {
            const generatedPassword = Math.random().toString(36).slice(-8);
            generatedPasswords[professional.fullName || 'Profissional'] =
                generatedPassword;
        });

        this.generatedPasswordsSignal.set(generatedPasswords);

        this.completionSummaryMessageSignal.set(
            'Cadastro concluido com sucesso. Use o login da barbearia para continuar.'
        );
        this.registrationSubmittingSignal.set(false);
        this.completionDialogVisibleSignal.set(true);
    }
}
