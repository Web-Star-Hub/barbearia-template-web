import { Injectable } from '@angular/core';
import { businessConfiguration } from '../../../core/configuration/business.configuration';

@Injectable({
    providedIn: 'root',
})
export class GoogleCalendarLinkService {
    public buildGoogleCalendarLink(payload: {
        serviceName: string;
        barberName: string;
        startDateTimeIsoString: string;
        endDateTimeIsoString: string;
    }): string {
        const eventTitle = `${businessConfiguration.businessName} - ${payload.serviceName}`;
        const eventDetails = `Profissional: ${payload.barberName}`;
        const eventLocation = businessConfiguration.address;

        const startDateTime = this.formatDateToGoogleCalendarDate(payload.startDateTimeIsoString);
        const endDateTime = this.formatDateToGoogleCalendarDate(payload.endDateTimeIsoString);

        const queryParameters = new URLSearchParams({
            action: 'TEMPLATE',
            text: eventTitle,
            details: eventDetails,
            location: eventLocation,
            dates: `${startDateTime}/${endDateTime}`,
        });

        return `https://calendar.google.com/calendar/render?${queryParameters.toString()}`;
    }

    private formatDateToGoogleCalendarDate(dateIsoString: string): string {
        return dateIsoString.replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
}
