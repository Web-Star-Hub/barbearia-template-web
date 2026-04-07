"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarbershopRegistrationHttpController = void 0;
const http_response_factory_1 = require("../shared/http-response-factory");
class BarbershopRegistrationHttpController {
    barbershopRegistrationApplicationService;
    constructor(barbershopRegistrationApplicationService) {
        this.barbershopRegistrationApplicationService = barbershopRegistrationApplicationService;
    }
    register = async (request, response) => {
        try {
            const { barbershopName, ownerFullName, ownerEmail, cityName, stateCode, latitude, longitude, ownerPassword, profileImageUrl, whatsappContact, emailContact, taxIdentificationNumber, formattedAddress, opensOnPublicHolidays, timezoneIdentifier, openingHoursByWeekday, } = request.body;
            if (!ownerPassword || ownerPassword.trim().length < 6) {
                return (0, http_response_factory_1.sendErrorResponse)(response, 'BARBERSHOP_REGISTRATION_VALIDATION_ERROR', 'A senha do proprietario deve possuir no minimo 6 caracteres.', 'Informe uma senha valida para o proprietario.', 400);
            }
            const validatedLatitude = Number(latitude);
            const validatedLongitude = Number(longitude);
            if (Number.isNaN(validatedLatitude) || Number.isNaN(validatedLongitude)) {
                return (0, http_response_factory_1.sendErrorResponse)(response, 'BARBERSHOP_REGISTRATION_VALIDATION_ERROR', 'Latitude e longitude devem ser numericas.', 'Informe latitude e longitude validas.', 400);
            }
            const registrationResult = await this.barbershopRegistrationApplicationService.registerBarbershop({
                barbershopName,
                ownerFullName,
                ownerEmail,
                cityName,
                stateCode,
                latitude: validatedLatitude,
                longitude: validatedLongitude,
                ownerPassword,
                profileImageUrl,
                whatsappContact,
                emailContact,
                taxIdentificationNumber,
                formattedAddress,
                opensOnPublicHolidays,
                timezoneIdentifier,
                openingHoursByWeekday,
            });
            return (0, http_response_factory_1.sendSuccessResponse)(response, registrationResult, 201);
        }
        catch (error) {
            return (0, http_response_factory_1.sendErrorResponse)(response, 'BARBERSHOP_REGISTRATION_ERROR', error instanceof Error ? error.message : 'Erro inesperado.', 'Nao foi possivel concluir o cadastro da barbearia.');
        }
    };
}
exports.BarbershopRegistrationHttpController = BarbershopRegistrationHttpController;
