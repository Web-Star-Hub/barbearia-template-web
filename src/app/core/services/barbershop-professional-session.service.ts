import { Injectable, computed, signal } from '@angular/core';
import { BarbershopProfessionalProfileInterface } from '../models/barbershop-saas.models';
import { LocalStorageService } from './local-storage.service';

@Injectable({
    providedIn: 'root',
})
export class BarbershopProfessionalSessionService {
    private readonly accessTokenStorageKey = 'barbershopProfessionalAccessToken';
    private readonly profileStorageKey = 'barbershopProfessionalProfileJson';

    private readonly accessTokenSignal = signal<string | null>(null);
    private readonly professionalProfileSignal =
        signal<BarbershopProfessionalProfileInterface | null>(null);

    public readonly isAuthenticated = computed(() => this.accessTokenSignal() !== null);
    public readonly professionalProfile = computed(() =>
        this.professionalProfileSignal()
    );

    constructor(private readonly localStorageService: LocalStorageService) {
        this.restoreSessionFromStorage();
    }

    public setSession(
        accessToken: string,
        professionalProfile: BarbershopProfessionalProfileInterface
    ): void {
        this.accessTokenSignal.set(accessToken);
        this.professionalProfileSignal.set(professionalProfile);
        this.localStorageService.setItem(this.accessTokenStorageKey, accessToken);
        this.localStorageService.setItem(
            this.profileStorageKey,
            JSON.stringify(professionalProfile)
        );
    }

    public clearSession(): void {
        this.accessTokenSignal.set(null);
        this.professionalProfileSignal.set(null);
        this.localStorageService.removeItem(this.accessTokenStorageKey);
        this.localStorageService.removeItem(this.profileStorageKey);
    }

    public getAccessToken(): string | null {
        return this.accessTokenSignal();
    }

    private restoreSessionFromStorage(): void {
        const accessToken = this.localStorageService.getItem(this.accessTokenStorageKey);
        const profileRaw = this.localStorageService.getItem(this.profileStorageKey);
        this.accessTokenSignal.set(accessToken);
        if (!profileRaw) {
            return;
        }
        try {
            this.professionalProfileSignal.set(
                JSON.parse(profileRaw) as BarbershopProfessionalProfileInterface
            );
        } catch {
            this.clearSession();
        }
    }
}
