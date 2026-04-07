import { Request, Response } from 'express';
import { PublicServicesApplicationService } from '../../../application/services/public-services-application-service';
import {
    sendErrorResponse,
    sendSuccessResponse,
} from '../shared/http-response-factory';

export class PublicServicesHttpController {
    constructor(
        private readonly publicServicesApplicationService: PublicServicesApplicationService
    ) {}

    public getHealth = async (_request: Request, response: Response) => {
        try {
            const serviceHealthStatus =
                this.publicServicesApplicationService.getHealthStatus();

            return sendSuccessResponse(response, serviceHealthStatus);
        } catch (error) {
            return sendErrorResponse(
                response,
                'PUBLIC_SERVICES_HEALTH_ERROR',
                error instanceof Error ? error.message : 'Erro inesperado.',
                'Nao foi possivel consultar a saude do servico.'
            );
        }
    };

    public getMetadata = async (_request: Request, response: Response) => {
        try {
            const publicMetadata =
                this.publicServicesApplicationService.getPublicMetadata();

            return sendSuccessResponse(response, publicMetadata);
        } catch (error) {
            return sendErrorResponse(
                response,
                'PUBLIC_SERVICES_METADATA_ERROR',
                error instanceof Error ? error.message : 'Erro inesperado.',
                'Nao foi possivel consultar os metadados publicos.'
            );
        }
    };
}
