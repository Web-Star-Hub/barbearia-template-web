"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarbershopRegistrationApplicationService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class BarbershopRegistrationApplicationService {
    barbershopRepository;
    userAccountRepository;
    constructor(barbershopRepository, userAccountRepository) {
        this.barbershopRepository = barbershopRepository;
        this.userAccountRepository = userAccountRepository;
    }
    async registerBarbershop(input) {
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
        const ownerPasswordHash = await bcryptjs_1.default.hash(input.ownerPassword, 10);
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
exports.BarbershopRegistrationApplicationService = BarbershopRegistrationApplicationService;
