import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiSuccessResponseInterface } from '../../../core/models/api-response.interface';
import {
    AppointmentInterface,
    BarberInterface,
    BusinessLocationInterface,
    ServiceCatalogItemInterface,
} from '../../../core/models/domain.models';
import { AdminAccessStateService } from '../../../core/services/admin-access-state.service';

@Injectable({
    providedIn: 'root',
})
export class AdminApiService {
    private readonly apiBaseUrl = environment.apiBaseUrl;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly adminAccessStateService: AdminAccessStateService
    ) {}

    public createService(
        payload: {
            serviceName: string;
            priceInCents: number;
            estimatedDurationInMinutes: number;
        }
    ): Observable<ServiceCatalogItemInterface> {
        return this.httpClient
            .post<ApiSuccessResponseInterface<ServiceCatalogItemInterface>>(
                `${this.apiBaseUrl}/services`,
                payload,
                {
                    headers: this.buildAdminHeaders(),
                }
            )
            .pipe(map((response) => response.data));
    }

    public updateService(
        serviceId: string,
        payload: {
            serviceName: string;
            priceInCents: number;
            estimatedDurationInMinutes: number;
        }
    ): Observable<ServiceCatalogItemInterface> {
        return this.httpClient
            .patch<ApiSuccessResponseInterface<ServiceCatalogItemInterface>>(
                `${this.apiBaseUrl}/services/${serviceId}`,
                payload,
                {
                    headers: this.buildAdminHeaders(),
                }
            )
            .pipe(map((response) => response.data));
    }

    public deleteService(serviceId: string): Observable<{ deleted: boolean }> {
        return this.httpClient
            .delete<ApiSuccessResponseInterface<{ deleted: boolean }>>(
                `${this.apiBaseUrl}/services/${serviceId}`,
                {
                    headers: this.buildAdminHeaders(),
                }
            )
            .pipe(map((response) => response.data));
    }

    public createBarber(
        payload: {
            fullName: string;
            workingDays: number[];
            workingStartTime: string;
            workingEndTime: string;
            lunchBreakStartTime?: string;
            lunchBreakEndTime?: string;
            availableServices: string[];
        }
    ): Observable<BarberInterface> {
        return this.httpClient
            .post<ApiSuccessResponseInterface<BarberInterface>>(
                `${this.apiBaseUrl}/barbers`,
                payload,
                {
                    headers: this.buildAdminHeaders(),
                }
            )
            .pipe(map((response) => response.data));
    }

    public updateBarber(
        barberId: string,
        payload: {
            fullName: string;
            workingDays: number[];
            workingStartTime: string;
            workingEndTime: string;
            lunchBreakStartTime?: string;
            lunchBreakEndTime?: string;
            availableServices: string[];
        }
    ): Observable<BarberInterface> {
        return this.httpClient
            .patch<ApiSuccessResponseInterface<BarberInterface>>(
                `${this.apiBaseUrl}/barbers/${barberId}`,
                payload,
                {
                    headers: this.buildAdminHeaders(),
                }
            )
            .pipe(map((response) => response.data));
    }

    public deleteBarber(barberId: string): Observable<{ deleted: boolean }> {
        return this.httpClient
            .delete<ApiSuccessResponseInterface<{ deleted: boolean }>>(
                `${this.apiBaseUrl}/barbers/${barberId}`,
                {
                    headers: this.buildAdminHeaders(),
                }
            )
            .pipe(map((response) => response.data));
    }

    public listAppointmentsByDate(
        dateIsoString: string,
        barberId?: string
    ): Observable<AppointmentInterface[]> {
        const queryParameters = new URLSearchParams({
            date: dateIsoString,
        });
        if (barberId) {
            queryParameters.set('barberId', barberId);
        }

        return this.httpClient
            .get<ApiSuccessResponseInterface<AppointmentInterface[]>>(
                `${this.apiBaseUrl}/admin/appointments?${queryParameters.toString()}`,
                {
                    headers: this.buildAdminHeaders(),
                }
            )
            .pipe(map((response) => response.data));
    }

    public cancelAppointmentByAdmin(
        appointmentId: string,
        cancellationReason: string
    ): Observable<AppointmentInterface> {
        return this.httpClient
            .patch<ApiSuccessResponseInterface<AppointmentInterface>>(
                `${this.apiBaseUrl}/admin/appointments/${appointmentId}/cancel`,
                {
                    cancellationReason: cancellationReason.trim(),
                },
                {
                    headers: this.buildAdminHeaders(),
                }
            )
            .pipe(map((response) => response.data));
    }

    public getBusinessLocationByAdmin(): Observable<BusinessLocationInterface | null> {
        return this.httpClient
            .get<ApiSuccessResponseInterface<BusinessLocationInterface | null>>(
                `${this.apiBaseUrl}/admin/business-location`,
                {
                    headers: this.buildAdminHeaders(),
                }
            )
            .pipe(map((response) => response.data));
    }

    public updateBusinessLocationByAdmin(payload: {
        fullAddress: string;
        mapQuery?: string;
    }): Observable<BusinessLocationInterface> {
        return this.httpClient
            .put<ApiSuccessResponseInterface<BusinessLocationInterface>>(
                `${this.apiBaseUrl}/admin/business-location`,
                payload,
                {
                    headers: this.buildAdminHeaders(),
                }
            )
            .pipe(map((response) => response.data));
    }

    private buildAdminHeaders(): HttpHeaders {
        return new HttpHeaders({
            'x-admin-key': this.adminAccessStateService.getAdminAccessKey(),
        });
    }
}
