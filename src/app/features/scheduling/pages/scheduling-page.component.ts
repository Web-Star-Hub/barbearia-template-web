import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxFadeComponent } from '@omnedia/ngx-fade';
import { NgxShineBorderComponent } from '@omnedia/ngx-shine-border';
import { Router } from '@angular/router';
import { BarberInterface } from '../../../core/models/domain.models';
import { ApiErrorResponseInterface } from '../../../core/models/api-response.interface';
import { formatDateTimeLabel } from '../../../shared/utils/date-formatter.util';
import { normalizePhoneNumber } from '../../../shared/utils/phone-formatter.util';
import { GoogleCalendarButtonComponent } from '../components/google-calendar-button.component';
import { SchedulingApiService } from '../services/scheduling-api.service';
import { SchedulingSelectionService } from '../services/scheduling-selection.service';
import { CustomerBookingCookieService } from '../../../core/services/customer-booking-cookie.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { forkJoin } from 'rxjs';

interface TimeSlotInterface {
    startsAt: string;
    endsAt: string;
}

interface DayOptionInterface {
    isoDateString: string;
    labelDate: string;
    labelWeekday: string;
}

@Component({
    selector: 'app-scheduling-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        NgxFadeComponent,
        NgxShineBorderComponent,
        GoogleCalendarButtonComponent,
    ],
    template: `
        <section
            class="scheduling-shell"
            *ngIf="selectedService() as selectedServiceCatalogItem"
        >
            <om-fade direction="up">
                <article class="scheduling-panel">
                    <h2 class="service-title">
                        {{ selectedServiceCatalogItem.serviceName }}
                    </h2>

                    <div class="step-indicator-list" *ngIf="currentStepIndex() < 5">
                        <span
                            class="step-indicator-item"
                            *ngFor="let stepLabel of stepLabels; let stepIndex = index"
                            [class.step-indicator-item-active]="currentStepIndex() === stepIndex"
                            [class.step-indicator-item-completed]="
                                currentStepIndex() > stepIndex
                            "
                        >
                            {{ stepIndex + 1 }}
                        </span>
                    </div>

                    <h3 class="section-title" *ngIf="currentStepIndex() === 0">
                        Selecione o dia da semana desejado
                    </h3>
                    <h3 class="section-title" *ngIf="currentStepIndex() === 1">
                        Escolha um horario disponivel
                    </h3>
                    <h3 class="section-title" *ngIf="currentStepIndex() === 2">
                        Selecione o profissional
                    </h3>
                    <h3 class="section-title" *ngIf="currentStepIndex() === 3">
                        Informe seus dados
                    </h3>
                    <h3 class="section-title" *ngIf="currentStepIndex() === 4">
                        Revise o resumo e confirme
                    </h3>

                    <div class="step-content-shell" *ngIf="currentStepIndex() < 5">
                        <om-shine-border *ngIf="currentStepIndex() === 0">
                            <div class="section-shell">
                                <div class="day-grid">
                                    <button
                                        type="button"
                                        class="day-chip"
                                        *ngFor="let dayOption of dayOptions(); let dayIndex = index"
                                        (click)="selectDay(dayIndex)"
                                        [class.day-chip-selected]="selectedDayIndex() === dayIndex"
                                    >
                                        <span>{{ dayOption.labelDate }}</span>
                                        <strong>{{ dayOption.labelWeekday }}</strong>
                                    </button>
                                </div>
                            </div>
                        </om-shine-border>

                        <om-shine-border *ngIf="currentStepIndex() === 1">
                            <div class="section-shell">
                                <div
                                    class="time-grid"
                                    *ngIf="timeSlots().length > 0; else noTimeSlotsTemplate"
                                >
                                    <button
                                        type="button"
                                        class="time-chip"
                                        *ngFor="let timeSlot of timeSlots()"
                                        (click)="selectTimeSlot(timeSlot)"
                                        [class.time-chip-selected]="
                                            selectedTimeSlot()?.startsAt === timeSlot.startsAt
                                        "
                                    >
                                        {{ formatOnlyHour(timeSlot.startsAt) }}
                                    </button>
                                </div>
                            </div>
                        </om-shine-border>

                        <om-shine-border *ngIf="currentStepIndex() === 2">
                            <div class="section-shell">
                                <div class="professional-grid">
                                    <button
                                        type="button"
                                        class="professional-card"
                                        *ngFor="let barber of barbers()"
                                        [class.professional-card-selected]="
                                            selectedBarberId() === barber.id
                                        "
                                        [class.professional-card-unavailable]="
                                            !isProfessionalAvailableForSelectedTimeSlot(barber.id)
                                        "
                                        [disabled]="
                                            !isProfessionalAvailableForSelectedTimeSlot(barber.id)
                                        "
                                        (click)="selectBarber(barber.id)"
                                    >
                                        <div class="professional-avatar">
                                            {{ buildAvatarInitials(barber.fullName) }}
                                        </div>
                                        <span>{{ barber.fullName }}</span>
                                    </button>
                                </div>
                            </div>
                        </om-shine-border>

                        <ng-template #noTimeSlotsTemplate>
                            <p class="helper-message">
                                Nenhum horario disponivel para o dia selecionado.
                            </p>
                        </ng-template>

                        <om-shine-border *ngIf="currentStepIndex() === 3">
                            <section class="form-panel">
                                <label>
                                    Nome e sobrenome:
                                    <input
                                        type="text"
                                        [ngModel]="customerFullName()"
                                        (ngModelChange)="setCustomerFullName($event)"
                                        placeholder="Nome e sobrenome"
                                    />
                                </label>
                                <label>
                                    Telefone:
                                    <input
                                        type="text"
                                        [ngModel]="customerPhoneNumber()"
                                        (ngModelChange)="setCustomerPhoneNumber($event)"
                                        placeholder="(99)99999-9999"
                                    />
                                </label>
                            </section>
                        </om-shine-border>

                        <om-shine-border
                            *ngIf="currentStepIndex() === 4 && selectedTimeSlot() as selectedTimeSlotItem"
                        >
                            <section class="summary-panel">
                                <h3>RESUMO</h3>
                                <p>{{ selectedServiceCatalogItem.serviceName }}</p>
                                <p>Profissional {{ selectedBarberName() }}</p>
                                <p>{{ formatDateTimeLabel(selectedTimeSlotItem.startsAt) }}</p>
                                <p>{{ customerFullName() }}</p>
                                <p>{{ customerPhoneNumber() }}</p>
                                <button
                                    type="button"
                                    class="schedule-button"
                                    (click)="confirmAppointment()"
                                    [disabled]="!canSubmitAppointment()"
                                >
                                    AGENDAR
                                </button>
                            </section>
                        </om-shine-border>
                    </div>

                    <div class="navigation-controls" *ngIf="currentStepIndex() < 5">
                        <button
                            type="button"
                            class="navigation-button navigation-button-secondary"
                            (click)="goToPreviousStep()"
                            [disabled]="currentStepIndex() === 0"
                        >
                            Voltar
                        </button>
                        <button
                            type="button"
                            class="navigation-button navigation-button-primary"
                            (click)="goToNextStep()"
                            [disabled]="!canAdvanceToNextStep()"
                            *ngIf="currentStepIndex() < 4"
                        >
                            Avancar
                        </button>
                    </div>

                    <om-fade
                        direction="up"
                        *ngIf="currentStepIndex() === 5 && confirmedAppointmentTimeSlot() as confirmedTimeSlot"
                    >
                        <om-shine-border>
                            <section class="confirmation-panel">
                                <h3>Agendamento confirmado</h3>
                                <p class="confirmation-date-time">
                                    {{ formatDateTimeLabel(confirmedTimeSlot.startsAt) }}
                                </p>
                                <app-google-calendar-button
                                    [serviceName]="selectedServiceCatalogItem.serviceName"
                                    [barberName]="selectedBarberName()"
                                    [appointmentStartDateTimeIsoString]="confirmedTimeSlot.startsAt"
                                    [appointmentEndDateTimeIsoString]="confirmedTimeSlot.endsAt"
                                />
                                <button
                                    type="button"
                                    class="navigation-button navigation-button-primary"
                                    (click)="restartSchedulingFlow()"
                                >
                                    Novo agendamento
                                </button>
                            </section>
                        </om-shine-border>
                    </om-fade>
                </article>
            </om-fade>
        </section>
    `,
    styles: `
        .scheduling-shell {
            width: 100%;
            display: grid;
            justify-items: center;
            align-items: center;
            min-height: calc(100vh - 220px);
        }

        .scheduling-shell > om-fade {
            width: min(560px, 100%);
            display: block;
        }

        .scheduling-panel {
            width: 100%;
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 18px;
            padding: 18px;
            background: linear-gradient(
                180deg,
                rgba(255, 255, 255, 0.06),
                rgba(255, 255, 255, 0.02)
            );
            display: grid;
            gap: 16px;
            min-height: 640px;
        }

        .step-content-shell {
            min-height: 340px;
            display: grid;
            align-content: start;
        }

        .service-title {
            text-align: center;
            margin: 0;
            font-size: 2rem;
            letter-spacing: 1px;
        }

        .step-indicator-list {
            display: flex;
            justify-content: center;
            gap: 8px;
        }

        .step-indicator-item {
            width: 28px;
            height: 28px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.4);
            display: grid;
            place-items: center;
            color: var(--color-text-secondary);
            font-size: 0.8rem;
        }

        .step-indicator-item-active {
            border-color: var(--color-primary);
            color: var(--color-primary);
        }

        .step-indicator-item-completed {
            border-color: #d9d7cf;
            background: #d9d7cf;
            color: #1a1a1a;
        }

        .section-title {
            margin: 0;
            text-align: center;
            color: var(--color-text-secondary);
            font-size: 1.35rem;
        }

        .section-shell {
            padding: 10px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.03);
        }

        .day-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(98px, 1fr));
            gap: 8px;
        }

        .day-chip {
            border: 2px solid rgba(255, 255, 255, 0.74);
            border-radius: 12px;
            background: rgba(0, 0, 0, 0.3);
            color: var(--color-text);
            min-height: 66px;
            display: grid;
            justify-items: center;
            align-content: center;
            gap: 4px;
            cursor: pointer;
        }

        .day-chip-selected {
            background: #d9d7cf;
            color: #1a1a1a;
            border-color: #f4f1e6;
        }

        .professional-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
        }

        .professional-card {
            border: 2px solid transparent;
            border-radius: 14px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.02);
            color: var(--color-text);
            display: grid;
            gap: 8px;
            justify-items: center;
            cursor: pointer;
        }

        .professional-card-selected {
            background: #d9d7cf;
            color: #1a1a1a;
            border-color: #f4f1e6;
        }

        .professional-card-unavailable {
            background: rgba(130, 130, 130, 0.2);
            color: rgba(255, 255, 255, 0.45);
            border-color: rgba(180, 180, 180, 0.3);
            cursor: not-allowed;
            opacity: 0.7;
        }

        .professional-card:disabled {
            pointer-events: none;
        }

        .professional-avatar {
            width: 66px;
            height: 66px;
            border-radius: 999px;
            display: grid;
            place-items: center;
            background: radial-gradient(circle, var(--color-primary), #2a2a34);
            font-weight: 800;
            color: #1a1a1a;
            border: 2px solid rgba(255, 255, 255, 0.6);
        }

        .time-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(84px, 1fr));
            gap: 8px;
        }

        .time-chip {
            border: 2px solid rgba(255, 255, 255, 0.74);
            border-radius: 10px;
            min-height: 50px;
            background: rgba(0, 0, 0, 0.3);
            color: var(--color-text);
            font-size: 1.2rem;
            cursor: pointer;
        }

        .time-chip-selected {
            background: #d9d7cf;
            color: #1a1a1a;
            border-color: #f4f1e6;
        }

        .helper-message {
            margin: 0;
            text-align: center;
            color: var(--color-text-secondary);
        }

        .form-panel {
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 14px;
            padding: 16px;
            display: grid;
            gap: 10px;
            background: rgba(0, 0, 0, 0.25);
        }

        .form-panel label {
            display: grid;
            gap: 6px;
            font-size: 1.1rem;
        }

        .form-panel input {
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            background: #d9d7cf;
            color: #1a1a1a;
            padding: 10px;
            font-size: 1rem;
        }

        .summary-panel {
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 14px;
            padding: 16px;
            display: grid;
            gap: 8px;
            text-align: center;
            background: rgba(0, 0, 0, 0.25);
        }

        .summary-panel h3 {
            margin: 0;
            font-size: 2rem;
            letter-spacing: 1px;
        }

        .summary-panel p {
            margin: 0;
            font-size: 1.2rem;
        }

        .schedule-button {
            border: none;
            border-radius: 10px;
            min-height: 50px;
            background: #d9d7cf;
            color: #1a1a1a;
            font-weight: 700;
            letter-spacing: 0.5px;
            font-size: 1.15rem;
            cursor: pointer;
        }

        .schedule-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .navigation-controls {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .navigation-button {
            min-height: 46px;
            border-radius: 10px;
            border: none;
            font-weight: 700;
            cursor: pointer;
        }

        .navigation-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .navigation-button-secondary {
            background: rgba(255, 255, 255, 0.14);
            color: var(--color-text);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .navigation-button-primary {
            background: #d9d7cf;
            color: #1a1a1a;
        }

        .confirmation-panel {
            display: grid;
            gap: 12px;
            border: 1px solid rgba(212, 175, 55, 0.4);
            border-radius: 12px;
            padding: 16px;
            background: rgba(212, 175, 55, 0.08);
            justify-items: stretch;
        }

        .confirmation-panel h3,
        .confirmation-panel p {
            margin: 0;
            text-align: center;
        }

        .confirmation-date-time {
            color: var(--color-text-secondary);
            font-weight: 700;
        }

        .confirmation-panel app-google-calendar-button,
        .confirmation-panel .navigation-button {
            width: 100%;
        }

        @media (max-width: 640px) {
            .scheduling-shell {
                min-height: auto;
                align-items: start;
            }

            .day-grid,
            .professional-grid,
            .time-grid,
            .navigation-controls {
                grid-template-columns: 1fr;
            }

            .service-title {
                font-size: 1.6rem;
            }

            .section-title {
                font-size: 1.12rem;
            }

            .day-chip,
            .professional-card,
            .time-chip,
            .navigation-button,
            .schedule-button {
                width: 100%;
            }
        }
    `,
})
export class SchedulingPageComponent {
    private readonly schedulingSelectionService = inject(SchedulingSelectionService);
    private readonly schedulingApiService = inject(SchedulingApiService);
    private readonly customerBookingCookieService = inject(CustomerBookingCookieService);
    private readonly snackbarService = inject(SnackbarService);
    private readonly router = inject(Router);

    protected readonly stepLabels = [
        'Dia',
        'Horario',
        'Profissional',
        'Dados',
        'Resumo',
    ];
    protected readonly currentStepIndex = signal(0);
    protected readonly selectedService = this.schedulingSelectionService.selectedService;
    protected readonly barbers = signal<BarberInterface[]>([]);
    protected readonly selectedBarberId = signal('');
    protected readonly selectedDayIndex = signal(0);
    protected readonly timeSlots = signal<TimeSlotInterface[]>([]);
    protected readonly availableTimeSlotsByBarberId = signal<
        Partial<Record<string, TimeSlotInterface[]>>
    >({});
    protected readonly selectedTimeSlot = signal<TimeSlotInterface | null>(null);
    protected readonly confirmedAppointmentTimeSlot = signal<TimeSlotInterface | null>(
        null
    );
    protected readonly customerFullName = signal('');
    protected readonly customerPhoneNumber = signal('');
    protected readonly dayOptions = signal<DayOptionInterface[]>(
        this.buildUpcomingDayOptions()
    );

    protected readonly selectedBarberName = computed(() => {
        return (
            this.barbers().find((barber) => barber.id === this.selectedBarberId())
                ?.fullName ?? ''
        );
    });

    constructor() {
        if (!this.selectedService()) {
            this.router.navigateByUrl('/agendar');
            return;
        }

        const customerBookingProfile =
            this.customerBookingCookieService.getCustomerBookingProfile();
        this.customerFullName.set(customerBookingProfile.fullName);
        this.customerPhoneNumber.set(customerBookingProfile.phoneNumber);

        this.schedulingApiService.listBarbers().subscribe((barberList) => {
            this.barbers.set(barberList);
            this.loadTimeSlots();
        });
    }

    protected goToPreviousStep(): void {
        if (this.currentStepIndex() === 0) {
            return;
        }
        this.currentStepIndex.set(this.currentStepIndex() - 1);
    }

    protected goToNextStep(): void {
        if (!this.canAdvanceToNextStep()) {
            return;
        }
        this.currentStepIndex.set(this.currentStepIndex() + 1);
    }

    protected canAdvanceToNextStep(): boolean {
        const stepIndex = this.currentStepIndex();

        if (stepIndex === 0) {
            return this.selectedDayIndex() >= 0;
        }
        if (stepIndex === 1) {
            return this.selectedTimeSlot() !== null;
        }
        if (stepIndex === 2) {
            return (
                this.selectedBarberId().length > 0 &&
                this.isProfessionalAvailableForSelectedTimeSlot(this.selectedBarberId())
            );
        }
        if (stepIndex === 3) {
            return this.customerFullName().trim().length > 0 &&
                this.customerPhoneNumber().trim().length > 0;
        }

        return false;
    }

    protected selectDay(dayIndex: number): void {
        this.selectedDayIndex.set(dayIndex);
        this.selectedTimeSlot.set(null);
        this.selectedBarberId.set('');
        this.loadTimeSlots();
    }

    protected selectBarber(barberId: string): void {
        if (!this.isProfessionalAvailableForSelectedTimeSlot(barberId)) {
            return;
        }
        this.selectedBarberId.set(barberId);
    }

    protected selectTimeSlot(timeSlot: TimeSlotInterface): void {
        this.selectedTimeSlot.set(timeSlot);
        if (!this.isProfessionalAvailableForSelectedTimeSlot(this.selectedBarberId())) {
            this.selectedBarberId.set('');
        }
    }

    protected canSubmitAppointment(): boolean {
        return (
            this.selectedTimeSlot() !== null &&
            this.customerFullName().trim().length > 0 &&
            this.customerPhoneNumber().trim().length > 0 &&
            this.selectedBarberId().length > 0
        );
    }

    protected confirmAppointment(): void {
        const selectedServiceCatalogItem = this.selectedService();
        const selectedTimeSlot = this.selectedTimeSlot();
        const customerFullName = this.customerFullName().trim();
        const customerPhoneNumber = normalizePhoneNumber(this.customerPhoneNumber());

        if (
            !selectedServiceCatalogItem ||
            !selectedTimeSlot ||
            !this.selectedBarberId() ||
            !customerFullName ||
            !customerPhoneNumber
        ) {
            return;
        }

        this.schedulingApiService
            .listAvailableSlots(
                this.selectedBarberId(),
                selectedTimeSlot.startsAt,
                selectedServiceCatalogItem.id
            )
            .subscribe((availableSlots) => {
                const isSelectedSlotStillAvailable = availableSlots.some(
                    (availableSlot) => availableSlot.startsAt === selectedTimeSlot.startsAt
                );
                if (!isSelectedSlotStillAvailable) {
                    this.handleUnavailableSlotConflict();
                    return;
                }

                this.schedulingApiService
                    .createAppointment({
                        fullName: customerFullName,
                        phoneNumber: customerPhoneNumber,
                        barberId: this.selectedBarberId(),
                        serviceId: selectedServiceCatalogItem.id,
                        appointmentDateTime: selectedTimeSlot.startsAt,
                    })
                    .subscribe({
                        next: () => {
                            this.customerBookingCookieService.saveCustomerBookingProfile({
                                fullName: customerFullName,
                                phoneNumber: customerPhoneNumber,
                            });
                            this.confirmedAppointmentTimeSlot.set(selectedTimeSlot);
                            this.currentStepIndex.set(5);
                        },
                        error: (httpErrorResponse: { error?: ApiErrorResponseInterface }) => {
                            const errorCode = httpErrorResponse?.error?.errorCode;
                            if (errorCode === 'UNAVAILABLE_SLOT') {
                                this.handleUnavailableSlotConflict();
                                return;
                            }
                            this.snackbarService.showError(
                                httpErrorResponse?.error?.userFriendlyMessage ??
                                    'Nao foi possivel confirmar o agendamento.'
                            );
                        },
                    });
            });
    }

    protected restartSchedulingFlow(): void {
        this.selectedTimeSlot.set(null);
        this.selectedBarberId.set('');
        this.confirmedAppointmentTimeSlot.set(null);
        const customerBookingProfile =
            this.customerBookingCookieService.getCustomerBookingProfile();
        this.customerFullName.set(customerBookingProfile.fullName);
        this.customerPhoneNumber.set(customerBookingProfile.phoneNumber);
        this.currentStepIndex.set(0);
        this.loadTimeSlots();
    }

    protected formatDateTimeLabel(dateTimeIsoString: string): string {
        return formatDateTimeLabel(dateTimeIsoString);
    }

    protected formatOnlyHour(dateTimeIsoString: string): string {
        return new Date(dateTimeIsoString).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    protected buildAvatarInitials(fullName: string): string {
        return fullName
            .split(' ')
            .filter((namePart) => namePart.length > 0)
            .slice(0, 2)
            .map((namePart) => namePart[0].toUpperCase())
            .join('');
    }

    protected setCustomerFullName(customerFullName: string): void {
        this.customerFullName.set(customerFullName);
        this.customerBookingCookieService.saveCustomerFullName(customerFullName);
    }

    protected setCustomerPhoneNumber(customerPhoneNumber: string): void {
        this.customerPhoneNumber.set(customerPhoneNumber);
        this.customerBookingCookieService.saveCustomerPhoneNumber(customerPhoneNumber);
    }

    protected isProfessionalAvailableForSelectedTimeSlot(barberId: string): boolean {
        const selectedTimeSlot = this.selectedTimeSlot();
        if (!selectedTimeSlot || !barberId) {
            return false;
        }
        const timeSlotsForBarber = this.availableTimeSlotsByBarberId()[barberId] ?? [];
        return timeSlotsForBarber.some(
            (timeSlot) => timeSlot.startsAt === selectedTimeSlot.startsAt
        );
    }

    private loadTimeSlots(): void {
        const selectedDayOption = this.dayOptions()[this.selectedDayIndex()];
        const selectedServiceCatalogItem = this.selectedService();
        const barbers = this.barbers();

        if (!selectedDayOption || !selectedServiceCatalogItem || barbers.length === 0) {
            this.availableTimeSlotsByBarberId.set({});
            this.timeSlots.set([]);
            return;
        }

        const availableSlotsByBarberRequestList = barbers.map((barber) =>
            this.schedulingApiService.listAvailableSlots(
                barber.id,
                selectedDayOption.isoDateString,
                selectedServiceCatalogItem.id
            )
        );

        forkJoin(availableSlotsByBarberRequestList).subscribe((availableSlotsByBarberList) => {
            const availableTimeSlotsByBarberId: Partial<Record<string, TimeSlotInterface[]>> =
                {};
            const uniqueTimeSlotByStartsAt = new Map<string, TimeSlotInterface>();

            barbers.forEach((barber, barberIndex) => {
                const timeSlotsForBarber = availableSlotsByBarberList[barberIndex] ?? [];
                availableTimeSlotsByBarberId[barber.id] = timeSlotsForBarber;

                timeSlotsForBarber.forEach((timeSlotForBarber) => {
                    if (!uniqueTimeSlotByStartsAt.has(timeSlotForBarber.startsAt)) {
                        uniqueTimeSlotByStartsAt.set(
                            timeSlotForBarber.startsAt,
                            timeSlotForBarber
                        );
                    }
                });
            });

            const sortedTimeSlots = Array.from(uniqueTimeSlotByStartsAt.values()).sort(
                (leftTimeSlot, rightTimeSlot) =>
                    new Date(leftTimeSlot.startsAt).getTime() -
                    new Date(rightTimeSlot.startsAt).getTime()
            );

            this.availableTimeSlotsByBarberId.set(availableTimeSlotsByBarberId);
            this.timeSlots.set(sortedTimeSlots);

            const selectedTimeSlot = this.selectedTimeSlot();
            const isSelectedTimeSlotStillAvailable =
                selectedTimeSlot !== null &&
                sortedTimeSlots.some(
                    (sortedTimeSlot) => sortedTimeSlot.startsAt === selectedTimeSlot.startsAt
                );
            if (!isSelectedTimeSlotStillAvailable) {
                this.selectedTimeSlot.set(null);
                this.selectedBarberId.set('');
                return;
            }

            if (!this.isProfessionalAvailableForSelectedTimeSlot(this.selectedBarberId())) {
                this.selectedBarberId.set('');
            }
        });
    }

    private handleUnavailableSlotConflict(): void {
        this.selectedTimeSlot.set(null);
        this.selectedBarberId.set('');
        this.currentStepIndex.set(1);
        this.loadTimeSlots();
        this.snackbarService.showError(
            'Este horario acabou de ser agendado por outro cliente. Escolha outro horario.'
        );
    }

    private buildUpcomingDayOptions(): DayOptionInterface[] {
        return Array.from({ length: 7 }).map((unusedValue, dayOffset) => {
            const dayDate = new Date();
            dayDate.setDate(dayDate.getDate() + dayOffset);
            dayDate.setHours(0, 0, 0, 0);

            const formattedDate = dayDate.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
            });
            const formattedWeekday = dayDate.toLocaleDateString('pt-BR', {
                weekday: 'long',
            });

            return {
                isoDateString: dayDate.toISOString(),
                labelDate: formattedDate,
                labelWeekday:
                    formattedWeekday.charAt(0).toUpperCase() + formattedWeekday.slice(1),
            };
        });
    }
}
