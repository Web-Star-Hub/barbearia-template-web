import { HttpClient, HttpHeaders } from '@angular/common/http';
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

@Injectable({
    providedIn: 'root',
})
export class BarbershopSaasPublicHttpService {
    private readonly apiRootUrl = `${environment.apiBaseUrl}/api`;

    constructor(private readonly httpClient: HttpClient) {}

    public listSubscriptionPlanDefinitions(): Observable<
        SubscriptionPlanDefinitionInterface[]
    > {
        return this.httpClient
            .get<
                ApiSuccessResponseInterface<SubscriptionPlanDefinitionInterface[]>
            >(`${this.apiRootUrl}/saas/public/subscription-plan-definitions`)
            .pipe(map((response) => response.data));
    }

    public listNearbyBarbershopsForClientDiscovery(input: {
        latitude: number;
        longitude: number;
        radiusInMeters?: number;
        searchQuery?: string;
    }): Observable<BarbershopDiscoveryCardInterface[]> {
        const params = new URLSearchParams({
            latitude: String(input.latitude),
            longitude: String(input.longitude),
        });
        if (input.radiusInMeters !== undefined) {
            params.set('radiusInMeters', String(input.radiusInMeters));
        }
        if (input.searchQuery) {
            params.set('searchQuery', input.searchQuery);
        }
        return this.httpClient
            .get<
                ApiSuccessResponseInterface<BarbershopDiscoveryCardInterface[]>
            >(`${this.apiRootUrl}/saas/public/barbershops/nearby-discovery?${params.toString()}`)
            .pipe(map((response) => response.data));
    }

    public listNearbyBarbershopsForProfessionalLogin(input: {
        latitude: number;
        longitude: number;
        radiusInMeters?: number;
        searchQuery?: string;
    }): Observable<BarbershopLoginOptionInterface[]> {
        const params = new URLSearchParams({
            latitude: String(input.latitude),
            longitude: String(input.longitude),
        });
        if (input.radiusInMeters !== undefined) {
            params.set('radiusInMeters', String(input.radiusInMeters));
        }
        if (input.searchQuery) {
            params.set('searchQuery', input.searchQuery);
        }
        return this.httpClient
            .get<
                ApiSuccessResponseInterface<BarbershopLoginOptionInterface[]>
            >(`${this.apiRootUrl}/saas/public/barbershops/nearby-login-selection?${params.toString()}`)
            .pipe(map((response) => response.data));
    }

    public registerAnonymousClientLead(payload: {
        barbershopTenantId: string;
        clientDisplayName: string;
        clientWhatsappNumber: string;
    }): Observable<{ leadAccessToken: string }> {
        return this.httpClient
            .post<
                ApiSuccessResponseInterface<{ leadAccessToken: string }>
            >(`${this.apiRootUrl}/saas/public/anonymous-client-leads`, payload)
            .pipe(map((response) => response.data));
    }

    public getWhatsappContactForVerifiedLead(
        barbershopTenantId: string,
        leadAccessToken: string
    ): Observable<{ whatsappContact: string }> {
        return this.httpClient
            .get<ApiSuccessResponseInterface<{ whatsappContact: string }>>(
                `${this.apiRootUrl}/saas/public/barbershops/${barbershopTenantId}/whatsapp-contact`,
                {
                    headers: new HttpHeaders({
                        Authorization: `Bearer ${leadAccessToken}`,
                    }),
                }
            )
            .pipe(map((response) => response.data));
    }

    public listPublicServiceOfferingsForBarbershop(
        barbershopTenantId: string
    ): Observable<BarbershopServiceOfferingInterface[]> {
        return this.httpClient
            .get<
                ApiSuccessResponseInterface<BarbershopServiceOfferingInterface[]>
            >(`${this.apiRootUrl}/saas/public/barbershops/${barbershopTenantId}/public-service-offerings`)
            .pipe(map((response) => response.data));
    }

    public completeBarbershopOnboarding(payload: unknown): Observable<{
        barbershopTenantId: string;
        generatedPasswordsByProfessionalName: Record<string, string>;
        accessTokenPlaceholder: null;
    }> {
        return this.httpClient
            .post<
                ApiSuccessResponseInterface<{
                    barbershopTenantId: string;
                    generatedPasswordsByProfessionalName: Record<string, string>;
                    accessTokenPlaceholder: null;
                }>
            >(`${this.apiRootUrl}/saas/public/barbershop-onboarding/complete`, payload)
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
            >(`${this.apiRootUrl}/saas/public/profile-images`, multipartBody)
            .pipe(map((response) => response.data));
    }
}
