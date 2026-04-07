export interface SubscriptionPlanDefinitionInterface {
    id: string;
    planDisplayName: string;
    planMarketingDescription: string;
    monthlyPriceInCents: number;
    yearlyPriceInCents: number;
    maximumProfessionalsPerBarbershop: number;
    includedFeatureLabels: string[];
    isActiveForNewSubscriptions: boolean;
}

export interface BarbershopDiscoveryCardInterface {
    barbershopTenantId: string;
    tradingName: string;
    profileImageUrl: string;
    formattedAddress: string;
    isOpenNow: boolean;
    opensOnPublicHolidays: boolean;
    whatsappContact?: string;
}

export interface BarbershopLoginOptionInterface {
    barbershopTenantId: string;
    tradingName: string;
    profileImageUrl: string;
    formattedAddress: string;
}

export interface BarbershopProfessionalProfileInterface {
    professionalId: string;
    barbershopTenantId: string;
    fullName: string;
    isBarbershopAdministrator: boolean;
    phoneNumberNormalized: string;
    emailAddressNormalized?: string;
}

export interface BarbershopServiceOfferingInterface {
    id: string;
    barbershopTenantId: string;
    serviceName: string;
    priceInCents: number;
    averageDurationInMinutes: number;
}

export interface BarbershopProfessionalListItemInterface {
    professionalId: string;
    fullName: string;
    profileImageUrl: string;
    phoneNumberNormalized: string;
    emailAddressNormalized?: string;
    barbershopServiceOfferingIds: string[];
    isBarbershopAdministrator: boolean;
}

export interface BarbershopTenantProfileInterface {
    id: string;
    tradingName: string;
    profileImageUrl: string;
    whatsappContact: string;
    emailContact?: string;
    taxIdentificationNumber?: string;
    formattedAddress: string;
    latitude: number;
    longitude: number;
    openingHoursByWeekday: Record<string, { opensAt: string; closesAt: string }[]>;
    opensOnPublicHolidays: boolean;
    timezoneIdentifier: string;
    subscriptionPlanDefinitionId: string;
    subscriptionLifecycleStatus: string;
    trialEndsAt?: string;
}
