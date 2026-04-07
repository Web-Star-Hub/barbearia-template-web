import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiSuccessResponseInterface } from '../../../core/models/api-response.interface';

export type BarbershopProfessionalLoginResponse = {
    accessToken: string;
    tokenType: string;
    expiresIn: string;
    authenticatedUser: {
        userAccountIdentifier: string;
        email: string;
        fullName: string;
        barbershopIdentifier: string;
        role: string;
    };
};

@Injectable({
    providedIn: 'root',
})
export class BarbershopProfessionalAuthenticationHttpService {
    private readonly apiRootUrl = environment.apiBaseUrl;

    constructor(private readonly httpClient: HttpClient) {}

    public loginBarbershopProfessionalWithEmailAndPassword(payload: {
        email: string;
        password: string;
    }): Observable<BarbershopProfessionalLoginResponse> {
        return this.httpClient
            .post<ApiSuccessResponseInterface<BarbershopProfessionalLoginResponse>>(
                `${this.apiRootUrl}/authentication/login`,
                payload
            )
            .pipe(map((response) => response.data));
    }
}
