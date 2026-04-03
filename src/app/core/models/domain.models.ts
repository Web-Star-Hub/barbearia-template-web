export interface UserProfileInterface {
    id: string;
    fullName: string;
    phoneNumber: string;
}

export interface ServiceCatalogItemInterface {
    id: string;
    serviceName: string;
    priceInCents: number;
    estimatedDurationInMinutes: number;
}

export interface BarberInterface {
    id: string;
    fullName: string;
    workingDays: number[];
    workingStartTime: string;
    workingEndTime: string;
    lunchBreakStartTime?: string;
    lunchBreakEndTime?: string;
    availableServices: string[];
}

export interface AppointmentInterface {
    id: string;
    userId: string;
    barberId: string;
    serviceId: string;
    appointmentDateTime: string;
    appointmentEndDateTime: string;
    status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
    cancellationReason?: string;
    cancellationActorType?: 'CUSTOMER' | 'ADMIN';
    customerFullName?: string;
    customerPhoneNumber?: string;
    barberName?: string;
    serviceName?: string;
}

export interface BusinessLocationInterface {
    id: string;
    fullAddress: string;
    mapQuery: string;
}
