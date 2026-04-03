import { Injectable, computed, signal } from '@angular/core';
import { UserProfileInterface } from '../models/domain.models';
import { LocalStorageService } from './local-storage.service';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationStateService {
    private readonly accessTokenStorageKey = 'accessToken';
    private readonly userProfileStorageKey = 'userProfile';

    private readonly accessTokenSignal = signal<string | null>(null);
    private readonly userProfileSignal = signal<UserProfileInterface | null>(null);

    public readonly isAuthenticated = computed(() => this.accessTokenSignal() !== null);
    public readonly userProfile = computed(() => this.userProfileSignal());

    constructor(private readonly localStorageService: LocalStorageService) {
        this.loadStateFromStorage();
    }

    public setSession(accessToken: string, userProfile: UserProfileInterface): void {
        this.accessTokenSignal.set(accessToken);
        this.userProfileSignal.set(userProfile);
        this.localStorageService.setItem(this.accessTokenStorageKey, accessToken);
        this.localStorageService.setItem(this.userProfileStorageKey, JSON.stringify(userProfile));
    }

    public clearSession(): void {
        this.accessTokenSignal.set(null);
        this.userProfileSignal.set(null);
        this.localStorageService.removeItem(this.accessTokenStorageKey);
        this.localStorageService.removeItem(this.userProfileStorageKey);
    }

    public getAccessToken(): string | null {
        return this.accessTokenSignal();
    }

    private loadStateFromStorage(): void {
        const accessToken = this.localStorageService.getItem(this.accessTokenStorageKey);
        const userProfileRaw = this.localStorageService.getItem(this.userProfileStorageKey);

        this.accessTokenSignal.set(accessToken);
        if (!userProfileRaw) {
            return;
        }

        try {
            this.userProfileSignal.set(JSON.parse(userProfileRaw) as UserProfileInterface);
        } catch {
            this.clearSession();
        }
    }
}
