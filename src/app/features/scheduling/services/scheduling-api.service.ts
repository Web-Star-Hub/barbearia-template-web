import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiSuccessResponseInterface } from '../../../core/models/api-response.interface';
import { BarberInterface } from '../../../core/models/domain.models';

interface TimeSlotInterface {
    startsAt: string;
    endsAt: string;
}

@Injectable({
    providedIn: 'root',
})
export class SchedulingApiService {
    private readonly apiBaseUrl = environment.apiBaseUrl;

    constructor(private readonly httpClient: HttpClient) {}

    public listBarbers(): Observable<BarberInterface[]> {
        return this.httpClient
            .get<ApiSuccessResponseInterface<BarberInterface[]>>(`${this.apiBaseUrl}/barbers`)
            .pipe(map((response) => response.data));
    }

    public listAvailableSlots(
        barberId: string,
        dateIsoString: string,
        serviceId?: string
    ): Observable<TimeSlotInterface[]> {
        let queryParameters = new HttpParams()
            .set('barberId', barberId)
            .set('date', dateIsoString);
        if (serviceId) {
            queryParameters = queryParameters.set('serviceId', serviceId);
        }
        queryParameters = queryParameters.set('cacheInvalidationTime', String(Date.now()));

        return this.httpClient
            .get<ApiSuccessResponseInterface<TimeSlotInterface[]>>(
                `${this.apiBaseUrl}/scheduling/available-slots`,
                { params: queryParameters }
            )
            .pipe(map((response) => response.data));
    }

    public createAppointment(payload: {
        fullName: string;
        phoneNumber: string;
        barberId: string;
        serviceId: string;
        appointmentDateTime: string;
    }) {
        return this.httpClient
            .post<ApiSuccessResponseInterface<{ id: string }>>(
                `${this.apiBaseUrl}/scheduling/appointments`,
                payload
            )
            .pipe(map((response) => response.data));
    }
}
