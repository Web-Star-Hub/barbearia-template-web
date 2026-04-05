import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiSuccessResponseInterface } from '../../../core/models/api-response.interface';
import { BarbershopProfessionalProfileInterface } from '../../../core/models/barbershop-saas.models';

@Injectable({
    providedIn: 'root',
})
export class BarbershopProfessionalAuthenticationHttpService {
    private readonly apiRootUrl = `${environment.apiBaseUrl}/api`;

    constructor(private readonly httpClient: HttpClient) {}

    public loginBarbershopProfessional(payload: {
        barbershopTenantId: string;
        loginIdentifier: string;
        password: string;
    }): Observable<{
        accessToken: string;
        professionalProfile: BarbershopProfessionalProfileInterface;
    }> {
        return this.httpClient
            .post<
                ApiSuccessResponseInterface<{
                    accessToken: string;
                    professionalProfile: BarbershopProfessionalProfileInterface;
                }>
            >(`${this.apiRootUrl}/saas/professional-authentication/login`, payload)
            .pipe(map((response) => response.data));
    }
}
