import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiSuccessResponseInterface } from '../../../core/models/api-response.interface';
import {
    BarbershopProfessionalListItemInterface,
    BarbershopServiceOfferingInterface,
    BarbershopTenantProfileInterface,
} from '../../../core/models/barbershop-saas.models';

@Injectable({
    providedIn: 'root',
})
export class BarbershopProfessionalPanelHttpService {
    private readonly apiRootUrl = environment.apiBaseUrl;

    constructor(private readonly httpClient: HttpClient) {}

    public getDashboardSummary(): Observable<{
        tradingName: string;
        subscriptionLifecycleStatus: string;
        trialEndsAt?: string;
        serviceOfferingCount: number;
        professionalCount: number;
    } | null> {
        return this.httpClient
            .get<
                ApiSuccessResponseInterface<{
                    tradingName: string;
                    subscriptionLifecycleStatus: string;
                    trialEndsAt?: string;
                    serviceOfferingCount: number;
                    professionalCount: number;
                } | null>
            >(`${this.apiRootUrl}/barbershop-panel/dashboard-summary`)
            .pipe(map((response) => response.data));
    }

    public getSubscriptionSummary(): Observable<{
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
    } | null> {
        return this.httpClient
            .get<
                ApiSuccessResponseInterface<{
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
                } | null>
            >(`${this.apiRootUrl}/barbershop-panel/subscription-summary`)
            .pipe(map((response) => response.data));
    }

    public getBarbershopTenantProfile(): Observable<BarbershopTenantProfileInterface | null> {
        return this.httpClient
            .get<
                ApiSuccessResponseInterface<BarbershopTenantProfileInterface | null>
            >(`${this.apiRootUrl}/barbershop-panel/barbershop-tenant-profile`)
            .pipe(map((response) => response.data));
    }

    public listServiceOfferings(): Observable<BarbershopServiceOfferingInterface[]> {
        return this.httpClient
            .get<
                ApiSuccessResponseInterface<BarbershopServiceOfferingInterface[]>
            >(`${this.apiRootUrl}/barbershop-panel/service-offerings`)
            .pipe(map((response) => response.data));
    }

    public createServiceOffering(payload: {
        serviceName: string;
        priceInCents: number;
        averageDurationInMinutes: number;
    }): Observable<BarbershopServiceOfferingInterface> {
        return this.httpClient
            .post<
                ApiSuccessResponseInterface<BarbershopServiceOfferingInterface>
            >(`${this.apiRootUrl}/barbershop-panel/service-offerings`, payload)
            .pipe(map((response) => response.data));
    }

    public updateServiceOffering(
        serviceOfferingId: string,
        payload: Partial<{
            serviceName: string;
            priceInCents: number;
            averageDurationInMinutes: number;
        }>
    ): Observable<BarbershopServiceOfferingInterface> {
        return this.httpClient
            .patch<
                ApiSuccessResponseInterface<BarbershopServiceOfferingInterface>
            >(`${this.apiRootUrl}/barbershop-panel/service-offerings/${serviceOfferingId}`, payload)
            .pipe(map((response) => response.data));
    }

    public deleteServiceOffering(
        serviceOfferingId: string
    ): Observable<{ deleted: boolean }> {
        return this.httpClient
            .delete<
                ApiSuccessResponseInterface<{ deleted: boolean }>
            >(`${this.apiRootUrl}/barbershop-panel/service-offerings/${serviceOfferingId}`)
            .pipe(map((response) => response.data));
    }

    public listProfessionals(): Observable<BarbershopProfessionalListItemInterface[]> {
        return this.httpClient
            .get<
                ApiSuccessResponseInterface<BarbershopProfessionalListItemInterface[]>
            >(`${this.apiRootUrl}/barbershop-panel/professionals`)
            .pipe(map((response) => response.data));
    }

    public createProfessional(payload: {
        fullName: string;
        profileImageUrl: string;
        phoneNumber: string;
        emailAddress?: string;
        barbershopServiceOfferingIds: string[];
        isBarbershopAdministrator: boolean;
    }): Observable<{ professionalId: string; generatedPlainPassword: string }> {
        return this.httpClient
            .post<
                ApiSuccessResponseInterface<{
                    professionalId: string;
                    generatedPlainPassword: string;
                }>
            >(`${this.apiRootUrl}/barbershop-panel/professionals`, payload)
            .pipe(map((response) => response.data));
    }

    public updateProfessionalProfile(
        professionalId: string,
        payload: Partial<{
            fullName: string;
            profileImageUrl: string;
            phoneNumber: string;
            emailAddress: string;
            barbershopServiceOfferingIds: string[];
        }>
    ): Observable<BarbershopProfessionalListItemInterface> {
        return this.httpClient
            .patch<
                ApiSuccessResponseInterface<BarbershopProfessionalListItemInterface>
            >(`${this.apiRootUrl}/barbershop-panel/professionals/${professionalId}`, payload)
            .pipe(map((response) => response.data));
    }

    public regenerateProfessionalPassword(
        professionalId: string
    ): Observable<{ newPlainPassword: string }> {
        return this.httpClient
            .post<
                ApiSuccessResponseInterface<{ newPlainPassword: string }>
            >(`${this.apiRootUrl}/barbershop-panel/professionals/${professionalId}/regenerate-password`, {})
            .pipe(map((response) => response.data));
    }

    public updateBarbershopTenantProfile(
        payload: Partial<{
            tradingName: string;
            profileImageUrl: string;
            whatsappContact: string;
            emailContact: string;
            taxIdentificationNumber: string;
            formattedAddress: string;
            latitude: number;
            longitude: number;
            openingHoursByWeekday: Record<
                string,
                { opensAt: string; closesAt: string }[]
            >;
            opensOnPublicHolidays: boolean;
            timezoneIdentifier: string;
        }>
    ): Observable<BarbershopTenantProfileInterface> {
        return this.httpClient
            .patch<
                ApiSuccessResponseInterface<BarbershopTenantProfileInterface>
            >(`${this.apiRootUrl}/barbershop-panel/barbershop-tenant-profile`, payload)
            .pipe(map((response) => response.data));
    }

    public setPrimaryAdministrator(newAdministratorProfessionalId: string): Observable<{
        success: boolean;
    }> {
        return this.httpClient
            .post<
                ApiSuccessResponseInterface<{ success: boolean }>
            >(`${this.apiRootUrl}/barbershop-panel/primary-administrator`, { newAdministratorProfessionalId })
            .pipe(map((response) => response.data));
    }
}
