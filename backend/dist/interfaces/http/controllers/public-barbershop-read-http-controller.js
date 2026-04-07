"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicBarbershopReadHttpController = void 0;
const mongoose_1 = require("mongoose");
const http_response_factory_1 = require("../shared/http-response-factory");
class PublicBarbershopReadHttpController {
    barbershopPanelApplicationService;
    constructor(barbershopPanelApplicationService) {
        this.barbershopPanelApplicationService = barbershopPanelApplicationService;
    }
    listPublicServiceOfferings = async (request, response) => {
        try {
            const barbershopIdentifier = request.params.barbershopIdentifier;
            if (!mongoose_1.Types.ObjectId.isValid(barbershopIdentifier)) {
                return (0, http_response_factory_1.sendErrorResponse)(response, 'PUBLIC_BARBERSHOP_INVALID_ID', 'Identificador da barbearia invalido.', 'Barbearia nao encontrada.', 404);
            }
            const serviceOfferings = await this.barbershopPanelApplicationService.listServiceOfferings(barbershopIdentifier);
            return (0, http_response_factory_1.sendSuccessResponse)(response, serviceOfferings);
        }
        catch (error) {
            return (0, http_response_factory_1.sendErrorResponse)(response, 'PUBLIC_BARBERSHOP_SERVICES_ERROR', error instanceof Error ? error.message : 'Erro inesperado.', 'Nao foi possivel carregar os servicos publicos.');
        }
    };
}
exports.PublicBarbershopReadHttpController = PublicBarbershopReadHttpController;
