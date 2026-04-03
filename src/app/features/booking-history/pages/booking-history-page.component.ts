import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxFadeComponent } from '@omnedia/ngx-fade';
import { NgxShineBorderComponent } from '@omnedia/ngx-shine-border';
import { AppointmentInterface } from '../../../core/models/domain.models';
import { CustomerBookingCookieService } from '../../../core/services/customer-booking-cookie.service';
import { BookingHistoryApiService } from '../services/booking-history-api.service';
import { formatDateTimeLabel } from '../../../shared/utils/date-formatter.util';

@Component({
    selector: 'app-booking-history-page',
    standalone: true,
    imports: [CommonModule, FormsModule, NgxFadeComponent, NgxShineBorderComponent],
    template: `
        <section class="page-shell">
            <om-fade direction="up">
                <om-shine-border>
                    <div class="query-block">
                        <h2>Historico</h2>
                        <p class="stored-customer-name" *ngIf="customerFullName()">
                            Cliente: {{ customerFullName() }}
                        </p>
                        <label>
                            Telefone para consultar agendamentos
                            <input
                                type="text"
                                [ngModel]="phoneNumber()"
                                (ngModelChange)="setPhoneNumber($event)"
                            />
                        </label>
                        <label>
                            Filtrar por data
                            <div class="appointment-date-filter-shell">
                                <input
                                    type="text"
                                    inputmode="numeric"
                                    maxlength="10"
                                    placeholder="dd/mm/yyyy"
                                    [ngModel]="appointmentDateFilter()"
                                    (ngModelChange)="setAppointmentDateFilter($event)"
                                />
                                <button
                                    type="button"
                                    class="appointment-date-picker-button"
                                    (click)="openNativeDatePicker(nativeAppointmentDateInput)"
                                    aria-label="Selecionar data no calendario"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M7 3V6M17 3V6M4 9H20M6 5H18C19.1046 5 20 5.89543 20 7V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V7C4 5.89543 4.89543 5 6 5Z"
                                            stroke="currentColor"
                                            stroke-width="1.8"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                    </svg>
                                </button>
                                <input
                                    #nativeAppointmentDateInput
                                    type="date"
                                    class="appointment-date-native-input"
                                    [value]="convertDateFilterToIsoDateString(appointmentDateFilter()) ?? ''"
                                    (change)="setAppointmentDateFilterFromIsoDate($any($event.target).value)"
                                />
                            </div>
                        </label>
                        <p
                            class="appointment-date-filter-validation-message"
                            *ngIf="appointmentDateFilterValidationMessage()"
                        >
                            {{ appointmentDateFilterValidationMessage() }}
                        </p>
                        <div class="query-actions">
                            <button
                                type="button"
                                (click)="loadAppointments()"
                                [disabled]="!phoneNumber().trim()"
                            >
                                Buscar agendamentos
                            </button>
                            <button
                                type="button"
                                class="secondary-button"
                                (click)="clearAppointmentDateFilter()"
                            >
                                Limpar filtro
                            </button>
                        </div>
                    </div>
                </om-shine-border>
            </om-fade>

            <om-fade direction="up" *ngFor="let appointment of appointments()">
                <om-shine-border>
                    <article class="appointment-card">
                        <h3>{{ appointment.serviceName }}</h3>
                        <p>{{ appointment.barberName }}</p>
                        <small>{{ formatDateTimeLabel(appointment.appointmentDateTime) }}</small>
                        <strong>{{ appointment.status }}</strong>
                        <label
                            class="cancellation-reason-field"
                            *ngIf="appointment.status === 'SCHEDULED'"
                        >
                            Motivo do cancelamento
                            <textarea
                                [ngModel]="cancellationReasonByAppointmentId()[appointment.id] ?? ''"
                                (ngModelChange)="
                                    setCancellationReasonForAppointment(appointment.id, $event)
                                "
                                rows="3"
                            ></textarea>
                        </label>
                        <button
                            type="button"
                            *ngIf="appointment.status === 'SCHEDULED'"
                            (click)="cancelAppointment(appointment.id)"
                            [disabled]="!canCancelAppointment(appointment.id)"
                        >
                            Cancelar
                        </button>
                    </article>
                </om-shine-border>
            </om-fade>
        </section>
    `,
    styles: `
        .page-shell {
            display: grid;
            gap: 12px;
            width: 100%;
            max-width: 560px;
            margin: 0 auto;
        }

        label {
            display: grid;
            gap: 6px;
        }

        .query-block {
            display: grid;
            gap: 10px;
            padding: 14px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.03);
        }

        .query-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }

        .appointment-date-filter-shell {
            position: relative;
            display: grid;
            align-items: center;
        }

        .appointment-date-picker-button {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            width: 34px;
            height: 34px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.22);
            background: rgba(255, 255, 255, 0.08);
            color: var(--color-text);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
            z-index: 1;
        }

        .appointment-date-picker-button svg {
            width: 18px;
            height: 18px;
        }

        .appointment-date-filter-shell input[type='text'] {
            padding-right: 50px;
        }

        .appointment-date-native-input {
            position: absolute;
            opacity: 0;
            pointer-events: none;
            width: 1px;
            height: 1px;
        }

        .stored-customer-name {
            margin: 0;
            color: var(--color-text-secondary);
            font-size: 0.92rem;
            font-weight: 600;
        }

        input,
        button,
        textarea {
            border: 1px solid rgba(255, 255, 255, 0.16);
            border-radius: 10px;
            background: var(--color-surface);
            color: var(--color-text);
            padding: 10px;
        }

        textarea {
            resize: vertical;
            min-height: 74px;
        }

        .secondary-button {
            background: rgba(255, 255, 255, 0.16);
        }

        .appointment-date-filter-validation-message {
            margin: 0;
            color: #ff9f9f;
            font-size: 0.9rem;
            font-weight: 600;
        }

        .appointment-card {
            display: grid;
            gap: 6px;
            background: var(--color-surface);
            padding: 14px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cancellation-reason-field {
            display: grid;
            gap: 6px;
        }

        h3,
        p,
        small {
            margin: 0;
        }

        @media (max-width: 640px) {
            .query-actions {
                grid-template-columns: 1fr;
            }
        }
    `,
})
export class BookingHistoryPageComponent {
    private readonly bookingHistoryApiService = inject(BookingHistoryApiService);
    private readonly customerBookingCookieService = inject(CustomerBookingCookieService);

    protected readonly appointments = signal<AppointmentInterface[]>([]);
    protected readonly customerFullName = signal('');
    protected readonly phoneNumber = signal('');
    protected readonly appointmentDateFilter = signal('');
    protected readonly appointmentDateFilterValidationMessage = signal('');
    protected readonly cancellationReasonByAppointmentId = signal<
        Partial<Record<string, string>>
    >({});

    constructor() {
        const customerBookingProfile =
            this.customerBookingCookieService.getCustomerBookingProfile();
        this.customerFullName.set(customerBookingProfile.fullName);
        this.phoneNumber.set(customerBookingProfile.phoneNumber);
        if (customerBookingProfile.phoneNumber.trim()) {
            this.loadAppointments();
        }
    }

    protected cancelAppointment(appointmentId: string): void {
        const cancellationReason =
            this.cancellationReasonByAppointmentId()[appointmentId] ?? '';
        if (!cancellationReason.trim()) {
            return;
        }

        this.bookingHistoryApiService
            .cancelAppointment(appointmentId, this.phoneNumber(), cancellationReason)
            .subscribe(() => {
                this.cancellationReasonByAppointmentId.update((currentCancellationReasons) => ({
                    ...currentCancellationReasons,
                    [appointmentId]: '',
                }));
                this.loadAppointments();
            });
    }

    protected setCancellationReasonForAppointment(
        appointmentId: string,
        cancellationReason: string
    ): void {
        this.cancellationReasonByAppointmentId.update((currentCancellationReasons) => ({
            ...currentCancellationReasons,
            [appointmentId]: cancellationReason,
        }));
    }

    protected canCancelAppointment(appointmentId: string): boolean {
        const cancellationReason =
            this.cancellationReasonByAppointmentId()[appointmentId] ?? '';
        return cancellationReason.trim().length > 0;
    }

    protected formatDateTimeLabel(dateTimeIsoString: string): string {
        return formatDateTimeLabel(dateTimeIsoString);
    }

    protected loadAppointments(): void {
        const convertedAppointmentDateFilter = this.convertDateFilterToIsoDateString(
            this.appointmentDateFilter()
        );
        if (
            this.appointmentDateFilter().trim().length > 0 &&
            !convertedAppointmentDateFilter
        ) {
            this.appointmentDateFilterValidationMessage.set(
                'Informe a data no formato dd/mm/yyyy.'
            );
            return;
        }

        this.appointmentDateFilterValidationMessage.set('');
        this.customerBookingCookieService.saveCustomerPhoneNumber(this.phoneNumber());
        this.bookingHistoryApiService
            .listAppointments(
                this.phoneNumber(),
                convertedAppointmentDateFilter || undefined
            )
            .subscribe((appointmentList) => this.appointments.set(appointmentList));
    }

    protected clearAppointmentDateFilter(): void {
        this.appointmentDateFilter.set('');
        this.appointmentDateFilterValidationMessage.set('');
        if (this.phoneNumber().trim()) {
            this.loadAppointments();
        }
    }

    protected setAppointmentDateFilter(rawAppointmentDateFilter: string): void {
        const onlyDigits = rawAppointmentDateFilter.replace(/\D/g, '').slice(0, 8);
        const day = onlyDigits.slice(0, 2);
        const month = onlyDigits.slice(2, 4);
        const year = onlyDigits.slice(4, 8);

        const formattedAppointmentDateFilter = [day, month, year]
            .filter((datePart) => datePart.length > 0)
            .join('/');

        this.appointmentDateFilter.set(formattedAppointmentDateFilter);
        this.appointmentDateFilterValidationMessage.set('');
    }

    protected setAppointmentDateFilterFromIsoDate(isoDateValue: string): void {
        if (!isoDateValue) {
            this.appointmentDateFilter.set('');
            this.appointmentDateFilterValidationMessage.set('');
            return;
        }

        const [yearText, monthText, dayText] = isoDateValue.split('-');
        if (!yearText || !monthText || !dayText) {
            return;
        }
        this.appointmentDateFilter.set(`${dayText}/${monthText}/${yearText}`);
        this.appointmentDateFilterValidationMessage.set('');
    }

    protected openNativeDatePicker(nativeAppointmentDateInput: HTMLInputElement): void {
        const inputWithPicker = nativeAppointmentDateInput as HTMLInputElement & {
            showPicker?: () => void;
        };
        if (inputWithPicker.showPicker) {
            inputWithPicker.showPicker();
            return;
        }
        nativeAppointmentDateInput.focus();
        nativeAppointmentDateInput.click();
    }

    protected setPhoneNumber(phoneNumber: string): void {
        this.phoneNumber.set(phoneNumber);
        this.customerBookingCookieService.saveCustomerPhoneNumber(phoneNumber);
    }

    protected convertDateFilterToIsoDateString(
        formattedAppointmentDateFilter: string
    ): string | null {
        const trimmedFormattedAppointmentDateFilter =
            formattedAppointmentDateFilter.trim();
        if (!trimmedFormattedAppointmentDateFilter) {
            return null;
        }

        const [dayText, monthText, yearText] =
            trimmedFormattedAppointmentDateFilter.split('/');
        if (
            !dayText ||
            !monthText ||
            !yearText ||
            dayText.length !== 2 ||
            monthText.length !== 2 ||
            yearText.length !== 4
        ) {
            return null;
        }

        const dayNumber = Number(dayText);
        const monthNumber = Number(monthText);
        const yearNumber = Number(yearText);
        if (
            Number.isNaN(dayNumber) ||
            Number.isNaN(monthNumber) ||
            Number.isNaN(yearNumber)
        ) {
            return null;
        }

        const parsedDate = new Date(yearNumber, monthNumber - 1, dayNumber);
        if (
            parsedDate.getFullYear() !== yearNumber ||
            parsedDate.getMonth() !== monthNumber - 1 ||
            parsedDate.getDate() !== dayNumber
        ) {
            return null;
        }

        const isoYearText = String(yearNumber);
        const isoMonthText = String(monthNumber).padStart(2, '0');
        const isoDayText = String(dayNumber).padStart(2, '0');
        return `${isoYearText}-${isoMonthText}-${isoDayText}`;
    }
}
