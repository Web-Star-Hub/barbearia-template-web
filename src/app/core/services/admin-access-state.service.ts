import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSuccessResponseInterface } from '../models/api-response.interface';
import { LocalStorageService } from './local-storage.service';

@Injectable({
    providedIn: 'root',
})
export class AdminAccessStateService {
    private readonly adminAccessKeyStorageKey = 'adminAccessKey';
    private readonly apiBaseUrl = environment.apiBaseUrl;
    private readonly adminAccessKeySignal = signal<string>('');

    public readonly hasAdminAccess = computed(
        () => this.adminAccessKeySignal().trim().length > 0
    );

    constructor(
        private readonly httpClient: HttpClient,
        private readonly localStorageService: LocalStorageService
    ) {
        this.loadAdminAccessKeyFromStorage();
    }

    public setAdminAccessKey(adminAccessKey: string): void {
        const sanitizedAdminAccessKey = adminAccessKey.trim();
        this.adminAccessKeySignal.set(sanitizedAdminAccessKey);
        this.localStorageService.setItem(
            this.adminAccessKeyStorageKey,
            sanitizedAdminAccessKey
        );
    }

    public clearAdminAccessKey(): void {
        this.adminAccessKeySignal.set('');
        this.localStorageService.removeItem(this.adminAccessKeyStorageKey);
    }

    public getAdminAccessKey(): string {
        return this.adminAccessKeySignal();
    }

    public validateAdminAccessKey(adminAccessKey: string): Observable<boolean> {
        const sanitizedAdminAccessKey = adminAccessKey.trim();
        if (!sanitizedAdminAccessKey) {
            return of(false);
        }

        return this.httpClient
            .get<ApiSuccessResponseInterface<{ authenticated: boolean }>>(
                `${this.apiBaseUrl}/admin/session`,
                {
                    headers: this.buildAdminHeaders(sanitizedAdminAccessKey),
                }
            )
            .pipe(
                map(() => true),
                catchError(() => of(false))
            );
    }

    public validateStoredAdminSession(): Observable<boolean> {
        return this.validateAdminAccessKey(this.adminAccessKeySignal());
    }

    private loadAdminAccessKeyFromStorage(): void {
        const storedAdminAccessKey =
            this.localStorageService.getItem(this.adminAccessKeyStorageKey) ?? '';
        this.adminAccessKeySignal.set(storedAdminAccessKey);
    }

    private buildAdminHeaders(adminAccessKey: string): HttpHeaders {
        return new HttpHeaders({
            'x-admin-key': adminAccessKey,
        });
    }
}
