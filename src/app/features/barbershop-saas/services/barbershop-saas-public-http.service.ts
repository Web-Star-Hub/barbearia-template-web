import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiSuccessResponseInterface } from '../../../core/models/api-response.interface';
import {
    BarbershopDiscoveryCardInterface,
    BarbershopLoginOptionInterface,
    BarbershopServiceOfferingInterface,
    SubscriptionPlanDefinitionInterface,
} from '../../../core/models/barbershop-saas.models';

type ApiPlanDocument = {
    identifier: string;
    displayName: string;
    monthlyPriceInCents: number;
    includedFeatures: string[];
    isActive: boolean;
};

type BarbershopLocationApiRow = {
    identifier: string;
    barbershopName: string;
    ownerFullName: string;
    ownerEmail: string;
    cityName: string;
    stateCode: string;
    registrationStatus: string;
    location: { latitude: number; longitude: number };
    whatsappContact?: string;
};

type BarbershopLocationDiscoveryResponse = {
    searchCenter: { latitude: number; longitude: number };
    radiusInKilometers: number;
    barbershops: BarbershopLocationApiRow[];
};

@Injectable({
    providedIn: 'root',
})
export class BarbershopSaasPublicHttpService {
    private readonly apiRootUrl = environment.apiBaseUrl;

    constructor(private readonly httpClient: HttpClient) {}

    private mapPlanToSubscriptionDefinition(
        plan: ApiPlanDocument
    ): SubscriptionPlanDefinitionInterface {
        const maximumProfessionalsPerBarbershop =
            plan.identifier === 'basic' ? 1 : plan.identifier === 'professional' ? 3 : 6;

        return {
            id: plan.identifier,
            planDisplayName: plan.displayName,
            planMarketingDescription: plan.includedFeatures.join(' · '),
            monthlyPriceInCents: plan.monthlyPriceInCents,
            yearlyPriceInCents: plan.monthlyPriceInCents * 12,
            maximumProfessionalsPerBarbershop,
            includedFeatureLabels: plan.includedFeatures,
            isActiveForNewSubscriptions: plan.isActive,
        };
    }

    private mapBarbershopToDiscoveryCard(
        row: BarbershopLocationApiRow
    ): BarbershopDiscoveryCardInterface {
        const formattedAddressLine = `${row.cityName} - ${row.stateCode}`;

        return {
            barbershopTenantId: row.identifier,
            tradingName: row.barbershopName,
            profileImageUrl: 'https://placehold.co/400x260/1a1a1a/ffffff?text=Barbearia',
            formattedAddress: formattedAddressLine,
            isOpenNow: true,
            opensOnPublicHolidays: false,
            whatsappContact: row.whatsappContact?.trim() || undefined,
        };
    }

    private mapBarbershopToLoginOption(
        row: BarbershopLocationApiRow
    ): BarbershopLoginOptionInterface {
        return {
            barbershopTenantId: row.identifier,
            tradingName: row.barbershopName,
            profileImageUrl: 'https://placehold.co/400x260/1a1a1a/ffffff?text=Barbearia',
            formattedAddress: `${row.cityName} - ${row.stateCode}`,
        };
    }

    public listSubscriptionPlanDefinitions(): Observable<
        SubscriptionPlanDefinitionInterface[]
    > {
        return this.httpClient
            .get<
                ApiSuccessResponseInterface<ApiPlanDocument[]>
            >(`${this.apiRootUrl}/plans`)
            .pipe(
                map((response) =>
                    response.data.map((plan) =>
                        this.mapPlanToSubscriptionDefinition(plan)
                    )
                )
            );
    }

    public getPublicApiHealth(): Observable<{ status: string }> {
        return this.httpClient
            .get<
                ApiSuccessResponseInterface<{
                    status: string;
                    service?: string;
                    timestamp?: string;
                }>
            >(`${this.apiRootUrl}/public-services/health`)
            .pipe(map((response) => ({ status: response.data.status })));
    }

    public listNearbyBarbershopsForClientDiscovery(input: {
        latitude: number;
        longitude: number;
        radiusInMeters?: number;
        searchQuery?: string;
    }): Observable<BarbershopDiscoveryCardInterface[]> {
        const radiusInKilometers = Math.max(
            1,
            Math.round((input.radiusInMeters ?? 50000) / 1000)
        );

        const queryParameters = new URLSearchParams({
            latitude: String(input.latitude),
            longitude: String(input.longitude),
            radiusInKilometers: String(radiusInKilometers),
        });

        return this.httpClient
            .get<
                ApiSuccessResponseInterface<BarbershopLocationDiscoveryResponse>
            >(`${this.apiRootUrl}/barbershop-location-discovery?${queryParameters.toString()}`)
            .pipe(
                map((response) => {
                    let mappedRows = response.data.barbershops.map((row) =>
                        this.mapBarbershopToDiscoveryCard(row)
                    );

                    const normalizedSearchQuery = input.searchQuery?.trim().toLowerCase();

                    if (normalizedSearchQuery) {
                        mappedRows = mappedRows.filter((card) =>
                            card.tradingName.toLowerCase().includes(normalizedSearchQuery)
                        );
                    }

                    return mappedRows;
                })
            );
    }

    public listNearbyBarbershopsForProfessionalLogin(input: {
        latitude: number;
        longitude: number;
        radiusInMeters?: number;
        searchQuery?: string;
    }): Observable<BarbershopLoginOptionInterface[]> {
        const radiusInKilometers = Math.max(
            1,
            Math.round((input.radiusInMeters ?? 200000) / 1000)
        );

        const queryParameters = new URLSearchParams({
            latitude: String(input.latitude),
            longitude: String(input.longitude),
            radiusInKilometers: String(radiusInKilometers),
        });

        return this.httpClient
            .get<
                ApiSuccessResponseInterface<BarbershopLocationDiscoveryResponse>
            >(`${this.apiRootUrl}/barbershop-location-discovery?${queryParameters.toString()}`)
            .pipe(
                map((response) => {
                    let mappedRows = response.data.barbershops.map((row) =>
                        this.mapBarbershopToLoginOption(row)
                    );

                    const normalizedSearchQuery = input.searchQuery?.trim().toLowerCase();

                    if (normalizedSearchQuery) {
                        mappedRows = mappedRows.filter((card) =>
                            card.tradingName.toLowerCase().includes(normalizedSearchQuery)
                        );
                    }

                    return mappedRows;
                })
            );
    }

    public registerBarbershop(payload: {
        barbershopName: string;
        ownerFullName: string;
        ownerEmail: string;
        cityName: string;
        stateCode: string;
        latitude: number;
        longitude: number;
        ownerPassword: string;
        profileImageUrl?: string;
        whatsappContact?: string;
        emailContact?: string;
        taxIdentificationNumber?: string;
        formattedAddress?: string;
        opensOnPublicHolidays?: boolean;
        timezoneIdentifier?: string;
        openingHoursByWeekday?: Record<string, { opensAt: string; closesAt: string }[]>;
    }): Observable<{
        identifier: string;
        barbershopName: string;
        ownerFullName: string;
        ownerEmail: string;
        cityName: string;
        stateCode: string;
        registrationStatus: string;
        location: { latitude: number; longitude: number };
    }> {
        return this.httpClient
            .post<
                ApiSuccessResponseInterface<{
                    identifier: string;
                    barbershopName: string;
                    ownerFullName: string;
                    ownerEmail: string;
                    cityName: string;
                    stateCode: string;
                    registrationStatus: string;
                    location: { latitude: number; longitude: number };
                }>
            >(`${this.apiRootUrl}/barbershop-registration`, payload)
            .pipe(map((response) => response.data));
    }

    public listPublicServiceOfferingsForBarbershop(
        barbershopTenantId: string
    ): Observable<BarbershopServiceOfferingInterface[]> {
        return this.httpClient
            .get<
                ApiSuccessResponseInterface<BarbershopServiceOfferingInterface[]>
            >(`${this.apiRootUrl}/barbershops/${barbershopTenantId}/public-service-offerings`)
            .pipe(map((response) => response.data));
    }

    public uploadPublicProfileImage(
        imageFile: File
    ): Observable<{ profileImageUrl: string }> {
        const multipartBody = new FormData();
        multipartBody.append('image', imageFile);
        return this.httpClient
            .post<
                ApiSuccessResponseInterface<{ profileImageUrl: string }>
            >(`${this.apiRootUrl}/public-file-uploads/profile-image`, multipartBody)
            .pipe(map((response) => response.data));
    }
}
