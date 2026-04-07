"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarbershopLocationDiscoveryHttpController = void 0;
const http_response_factory_1 = require("../shared/http-response-factory");
class BarbershopLocationDiscoveryHttpController {
    barbershopLocationDiscoveryApplicationService;
    constructor(barbershopLocationDiscoveryApplicationService) {
        this.barbershopLocationDiscoveryApplicationService = barbershopLocationDiscoveryApplicationService;
    }
    discoverByLocation = async (request, response) => {
        try {
            const latitude = Number(request.query.latitude);
            const longitude = Number(request.query.longitude);
            const radiusInKilometers = Number(request.query.radiusInKilometers ?? 5);
            if (Number.isNaN(latitude) ||
                Number.isNaN(longitude) ||
                Number.isNaN(radiusInKilometers)) {
                return (0, http_response_factory_1.sendErrorResponse)(response, 'BARBERSHOP_LOCATION_DISCOVERY_VALIDATION_ERROR', 'Os parametros de latitude, longitude e raio devem ser numericos.', 'Informe valores numericos validos para localizacao.', 400);
            }
            const searchResult = await this.barbershopLocationDiscoveryApplicationService.discoverByLocation({
                latitude,
                longitude,
                radiusInKilometers,
            });
            return (0, http_response_factory_1.sendSuccessResponse)(response, searchResult);
        }
        catch (error) {
            return (0, http_response_factory_1.sendErrorResponse)(response, 'BARBERSHOP_LOCATION_DISCOVERY_ERROR', error instanceof Error ? error.message : 'Erro inesperado.', 'Nao foi possivel buscar barbearias por localizacao.');
        }
    };
}
exports.BarbershopLocationDiscoveryHttpController = BarbershopLocationDiscoveryHttpController;
