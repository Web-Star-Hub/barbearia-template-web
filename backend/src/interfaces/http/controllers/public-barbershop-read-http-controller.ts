import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { BarbershopPanelApplicationService } from '../../../application/services/barbershop-panel-application-service';
import { sendErrorResponse, sendSuccessResponse } from '../shared/http-response-factory';

export class PublicBarbershopReadHttpController {
    constructor(
        private readonly barbershopPanelApplicationService: BarbershopPanelApplicationService
    ) {}

    public listPublicServiceOfferings = async (request: Request, response: Response) => {
        try {
            const barbershopIdentifier = request.params.barbershopIdentifier as string;

            if (!Types.ObjectId.isValid(barbershopIdentifier)) {
                return sendErrorResponse(
                    response,
                    'PUBLIC_BARBERSHOP_INVALID_ID',
                    'Identificador da barbearia invalido.',
                    'Barbearia nao encontrada.',
                    404
                );
            }

            const serviceOfferings =
                await this.barbershopPanelApplicationService.listServiceOfferings(
                    barbershopIdentifier
                );

            return sendSuccessResponse(response, serviceOfferings);
        } catch (error) {
            return sendErrorResponse(
                response,
                'PUBLIC_BARBERSHOP_SERVICES_ERROR',
                error instanceof Error ? error.message : 'Erro inesperado.',
                'Nao foi possivel carregar os servicos publicos.'
            );
        }
    };
}
