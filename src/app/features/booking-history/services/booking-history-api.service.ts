import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiSuccessResponseInterface } from '../../../core/models/api-response.interface';
import { AppointmentInterface } from '../../../core/models/domain.models';
import { normalizePhoneNumber } from '../../../shared/utils/phone-formatter.util';

@Injectable({
    providedIn: 'root',
})
export class BookingHistoryApiService {
    private readonly apiBaseUrl = environment.apiBaseUrl;

    constructor(private readonly httpClient: HttpClient) {}

    public listAppointments(
        phoneNumber: string,
        appointmentDate?: string
    ): Observable<AppointmentInterface[]> {
        const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
        const queryParameters = new URLSearchParams({
            phoneNumber: normalizedPhoneNumber,
        });
        if (appointmentDate?.trim()) {
            queryParameters.set('appointmentDate', appointmentDate);
        }

        return this.httpClient
            .get<ApiSuccessResponseInterface<AppointmentInterface[]>>(
                `${this.apiBaseUrl}/booking-history/appointments?${queryParameters.toString()}`
            )
            .pipe(map((response) => response.data));
    }

    public cancelAppointment(
        appointmentId: string,
        phoneNumber: string,
        cancellationReason: string
    ): Observable<AppointmentInterface> {
        const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
        return this.httpClient
            .patch<ApiSuccessResponseInterface<AppointmentInterface>>(
                `${this.apiBaseUrl}/scheduling/appointments/${appointmentId}/cancel`,
                {
                    phoneNumber: normalizedPhoneNumber,
                    cancellationReason: cancellationReason.trim(),
                }
            )
            .pipe(map((response) => response.data));
    }
}
