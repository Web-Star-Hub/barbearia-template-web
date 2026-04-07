export type BarbershopEntity = {
    identifier: string;
    barbershopName: string;
    ownerFullName: string;
    ownerEmail: string;
    cityName: string;
    stateCode: string;
    registrationStatus: 'pending_activation' | 'active';
    location: {
        latitude: number;
        longitude: number;
    };
    profileImageUrl?: string;
    whatsappContact?: string;
    emailContact?: string;
    taxIdentificationNumber?: string;
    formattedAddress?: string;
    opensOnPublicHolidays?: boolean;
    timezoneIdentifier?: string;
    openingHoursByWeekday?: Record<string, { opensAt: string; closesAt: string }[]>;
};
