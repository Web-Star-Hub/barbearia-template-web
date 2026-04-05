import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

@Injectable({
    providedIn: 'root',
})
export class AnonymousClientLeadSessionService {
    private readonly storageKeyPrefix = 'anonymousClientLeadTokenForBarbershop';

    constructor(private readonly localStorageService: LocalStorageService) {}

    public saveLeadAccessTokenForBarbershop(
        barbershopTenantId: string,
        leadAccessToken: string
    ): void {
        this.localStorageService.setItem(
            `${this.storageKeyPrefix}_${barbershopTenantId}`,
            leadAccessToken
        );
    }

    public getLeadAccessTokenForBarbershop(barbershopTenantId: string): string | null {
        return this.localStorageService.getItem(
            `${this.storageKeyPrefix}_${barbershopTenantId}`
        );
    }

    public saveClientDisplayProfile(
        clientDisplayName: string,
        clientWhatsappNumber: string
    ): void {
        this.localStorageService.setItem('anonymousClientDisplayName', clientDisplayName);
        this.localStorageService.setItem(
            'anonymousClientWhatsappNumber',
            clientWhatsappNumber
        );
    }

    public getStoredClientDisplayName(): string | null {
        return this.localStorageService.getItem('anonymousClientDisplayName');
    }

    public getStoredClientWhatsappNumber(): string | null {
        return this.localStorageService.getItem('anonymousClientWhatsappNumber');
    }
}
