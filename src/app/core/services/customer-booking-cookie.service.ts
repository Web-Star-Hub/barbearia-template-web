import { Injectable } from '@angular/core';

interface CustomerBookingProfileInterface {
    fullName: string;
    phoneNumber: string;
}

@Injectable({
    providedIn: 'root',
})
export class CustomerBookingCookieService {
    private readonly customerFullNameCookieKey = 'customerBookingFullName';
    private readonly customerPhoneNumberCookieKey = 'customerBookingPhoneNumber';
    private readonly cookieLifetimeInSeconds = 60 * 60 * 24 * 180;

    public saveCustomerBookingProfile(payload: CustomerBookingProfileInterface): void {
        this.saveCustomerFullName(payload.fullName);
        this.saveCustomerPhoneNumber(payload.phoneNumber);
    }

    public saveCustomerFullName(customerFullName: string): void {
        const normalizedCustomerFullName = customerFullName.trim();
        if (!normalizedCustomerFullName) {
            return;
        }
        this.setCookieValue(this.customerFullNameCookieKey, normalizedCustomerFullName);
    }

    public saveCustomerPhoneNumber(customerPhoneNumber: string): void {
        const normalizedCustomerPhoneNumber = customerPhoneNumber.trim();
        if (!normalizedCustomerPhoneNumber) {
            return;
        }
        this.setCookieValue(
            this.customerPhoneNumberCookieKey,
            normalizedCustomerPhoneNumber
        );
    }

    public getCustomerBookingProfile(): CustomerBookingProfileInterface {
        return {
            fullName: this.getCookieValue(this.customerFullNameCookieKey),
            phoneNumber: this.getCookieValue(this.customerPhoneNumberCookieKey),
        };
    }

    private setCookieValue(cookieKey: string, cookieValue: string): void {
        document.cookie = `${cookieKey}=${encodeURIComponent(
            cookieValue
        )}; path=/; max-age=${this.cookieLifetimeInSeconds}; samesite=lax`;
    }

    private getCookieValue(cookieKey: string): string {
        const cookieParts = document.cookie.split(';').map((cookiePart) => cookiePart.trim());
        const cookiePrefix = `${cookieKey}=`;
        const matchedCookiePart = cookieParts.find((cookiePart) =>
            cookiePart.startsWith(cookiePrefix)
        );
        if (!matchedCookiePart) {
            return '';
        }
        return decodeURIComponent(matchedCookiePart.slice(cookiePrefix.length));
    }
}
