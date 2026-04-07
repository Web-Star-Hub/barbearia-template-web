import { Request, Response } from 'express';
import { BarbershopLocationDiscoveryApplicationService } from '../../../application/services/barbershop-location-discovery-application-service';
import {
    sendErrorResponse,
    sendSuccessResponse,
} from '../shared/http-response-factory';

export class BarbershopLocationDiscoveryHttpController {
    constructor(
        private readonly barbershopLocationDiscoveryApplicationService: BarbershopLocationDiscoveryApplicationService
    ) {}

    public discoverByLocation = async (request: Request, response: Response) => {
        try {
            const latitude = Number(request.query.latitude);
            const longitude = Number(request.query.longitude);
            const radiusInKilometers = Number(
                request.query.radiusInKilometers ?? 5
            );

            if (
                Number.isNaN(latitude) ||
                Number.isNaN(longitude) ||
                Number.isNaN(radiusInKilometers)
            ) {
                return sendErrorResponse(
                    response,
                    'BARBERSHOP_LOCATION_DISCOVERY_VALIDATION_ERROR',
                    'Os parametros de latitude, longitude e raio devem ser numericos.',
                    'Informe valores numericos validos para localizacao.',
                    400
                );
            }

            const searchResult =
                await this.barbershopLocationDiscoveryApplicationService.discoverByLocation(
                    {
                        latitude,
                        longitude,
                        radiusInKilometers,
                    }
                );

            return sendSuccessResponse(response, searchResult);
        } catch (error) {
            return sendErrorResponse(
                response,
                'BARBERSHOP_LOCATION_DISCOVERY_ERROR',
                error instanceof Error ? error.message : 'Erro inesperado.',
                'Nao foi possivel buscar barbearias por localizacao.'
            );
        }
    };
}
