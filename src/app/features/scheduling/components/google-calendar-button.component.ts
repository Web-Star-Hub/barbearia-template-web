import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { businessConfiguration } from '../../../core/configuration/business.configuration';
import { GoogleCalendarLinkService } from '../services/google-calendar-link.service';

@Component({
    selector: 'app-google-calendar-button',
    standalone: true,
    imports: [CommonModule],
    template: `
        <a
            *ngIf="configuration.features.googleCalendarIntegration"
            class="google-calendar-button"
            [href]="calendarLink"
            target="_blank"
            rel="noreferrer"
        >
            Adicionar ao Google Agenda
        </a>
    `,
    styles: `
        .google-calendar-button {
            display: inline-flex;
            width: 100%;
            justify-content: center;
            align-items: center;
            min-height: 46px;
            padding: 10px 14px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 700;
            background: var(--color-primary);
            color: #101010;
            text-align: center;
        }
    `,
})
export class GoogleCalendarButtonComponent {
    @Input({ required: true })
    public serviceName = '';

    @Input({ required: true })
    public barberName = '';

    @Input({ required: true })
    public appointmentStartDateTimeIsoString = '';

    @Input({ required: true })
    public appointmentEndDateTimeIsoString = '';

    protected readonly configuration = businessConfiguration;

    constructor(
        private readonly googleCalendarLinkService: GoogleCalendarLinkService
    ) {}

    protected get calendarLink(): string {
        return this.googleCalendarLinkService.buildGoogleCalendarLink({
            serviceName: this.serviceName,
            barberName: this.barberName,
            startDateTimeIsoString: this.appointmentStartDateTimeIsoString,
            endDateTimeIsoString: this.appointmentEndDateTimeIsoString,
        });
    }
}
