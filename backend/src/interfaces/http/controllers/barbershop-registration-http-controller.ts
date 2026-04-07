import { Request, Response } from 'express';
import { BarbershopRegistrationApplicationService } from '../../../application/services/barbershop-registration-application-service';
import {
    sendErrorResponse,
    sendSuccessResponse,
} from '../shared/http-response-factory';

export class BarbershopRegistrationHttpController {
    constructor(
        private readonly barbershopRegistrationApplicationService: BarbershopRegistrationApplicationService
    ) {}

    public register = async (request: Request, response: Response) => {
        try {
            const {
                barbershopName,
                ownerFullName,
                ownerEmail,
                cityName,
                stateCode,
                latitude,
                longitude,
                ownerPassword,
                profileImageUrl,
                whatsappContact,
                emailContact,
                taxIdentificationNumber,
                formattedAddress,
                opensOnPublicHolidays,
                timezoneIdentifier,
                openingHoursByWeekday,
            } = request.body as {
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
                openingHoursByWeekday?: Record<
                    string,
                    { opensAt: string; closesAt: string }[]
                >;
            };

            if (!ownerPassword || ownerPassword.trim().length < 6) {
                return sendErrorResponse(
                    response,
                    'BARBERSHOP_REGISTRATION_VALIDATION_ERROR',
                    'A senha do proprietario deve possuir no minimo 6 caracteres.',
                    'Informe uma senha valida para o proprietario.',
                    400
                );
            }

            const validatedLatitude = Number(latitude);
            const validatedLongitude = Number(longitude);

            if (Number.isNaN(validatedLatitude) || Number.isNaN(validatedLongitude)) {
                return sendErrorResponse(
                    response,
                    'BARBERSHOP_REGISTRATION_VALIDATION_ERROR',
                    'Latitude e longitude devem ser numericas.',
                    'Informe latitude e longitude validas.',
                    400
                );
            }

            const registrationResult =
                await this.barbershopRegistrationApplicationService.registerBarbershop({
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

            return sendSuccessResponse(response, registrationResult, 201);
        } catch (error) {
            return sendErrorResponse(
                response,
                'BARBERSHOP_REGISTRATION_ERROR',
                error instanceof Error ? error.message : 'Erro inesperado.',
                'Nao foi possivel concluir o cadastro da barbearia.'
            );
        }
    };
}
