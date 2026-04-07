import bcrypt from 'bcryptjs';
import { BarbershopRepository } from '../ports/barbershop-repository';
import { UserAccountRepository } from '../ports/user-account-repository';

type RegisterBarbershopInput = {
    barbershopName: string;
    ownerFullName: string;
    ownerEmail: string;
    cityName: string;
    stateCode: string;
    latitude: number;
    longitude: number;
    ownerPassword: string;
    profileImageUrl?: string;
    whatsappContact?: string;
    emailContact?: string;
    taxIdentificationNumber?: string;
    formattedAddress?: string;
    opensOnPublicHolidays?: boolean;
    timezoneIdentifier?: string;
    openingHoursByWeekday?: Record<string, { opensAt: string; closesAt: string }[]>;
};

export class BarbershopRegistrationApplicationService {
    constructor(
        private readonly barbershopRepository: BarbershopRepository,
        private readonly userAccountRepository: UserAccountRepository
    ) {}

    public async registerBarbershop(input: RegisterBarbershopInput) {
        const createdBarbershop = await this.barbershopRepository.createBarbershop({
            barbershopName: input.barbershopName,
            ownerFullName: input.ownerFullName,
            ownerEmail: input.ownerEmail,
            cityName: input.cityName,
            stateCode: input.stateCode,
            registrationStatus: 'pending_activation',
            location: {
                latitude: input.latitude,
                longitude: input.longitude,
            },
            profileImageUrl: input.profileImageUrl,
            whatsappContact: input.whatsappContact,
            emailContact: input.emailContact,
            taxIdentificationNumber: input.taxIdentificationNumber,
            formattedAddress: input.formattedAddress,
            opensOnPublicHolidays: input.opensOnPublicHolidays,
            timezoneIdentifier: input.timezoneIdentifier,
            openingHoursByWeekday: input.openingHoursByWeekday,
        });

        const ownerPasswordHash = await bcrypt.hash(input.ownerPassword, 10);

        await this.userAccountRepository.createUserAccount({
            fullName: input.ownerFullName,
            email: input.ownerEmail,
            passwordHash: ownerPasswordHash,
            role: 'owner',
            barbershopIdentifier: createdBarbershop.identifier,
        });

        return createdBarbershop;
    }
}
