import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiSuccessResponseInterface } from '../../../core/models/api-response.interface';
import { UserProfileInterface } from '../../../core/models/domain.models';

interface AuthenticationResultInterface {
    accessToken: string;
    user: UserProfileInterface;
}

@Injectable({
    providedIn: 'root',
})
export class AuthenticationApiService {
    private readonly apiBaseUrl = environment.apiBaseUrl;

    constructor(private readonly httpClient: HttpClient) {}

    public register(payload: {
        fullName: string;
        phoneNumber: string;
        password: string;
    }): Observable<{ userId: string }> {
        return this.httpClient
            .post<ApiSuccessResponseInterface<{ userId: string }>>(
                `${this.apiBaseUrl}/authentication/register`,
                payload
            )
            .pipe(map((response) => response.data));
    }

    public login(payload: {
        phoneNumber: string;
        password: string;
    }): Observable<AuthenticationResultInterface> {
        return this.httpClient
            .post<ApiSuccessResponseInterface<AuthenticationResultInterface>>(
                `${this.apiBaseUrl}/authentication/login`,
                payload
            )
            .pipe(map((response) => response.data));
    }
}
