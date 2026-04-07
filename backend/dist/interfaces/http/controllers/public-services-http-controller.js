"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicServicesHttpController = void 0;
const http_response_factory_1 = require("../shared/http-response-factory");
class PublicServicesHttpController {
    publicServicesApplicationService;
    constructor(publicServicesApplicationService) {
        this.publicServicesApplicationService = publicServicesApplicationService;
    }
    getHealth = async (_request, response) => {
        try {
            const serviceHealthStatus = this.publicServicesApplicationService.getHealthStatus();
            return (0, http_response_factory_1.sendSuccessResponse)(response, serviceHealthStatus);
        }
        catch (error) {
            return (0, http_response_factory_1.sendErrorResponse)(response, 'PUBLIC_SERVICES_HEALTH_ERROR', error instanceof Error ? error.message : 'Erro inesperado.', 'Nao foi possivel consultar a saude do servico.');
        }
    };
    getMetadata = async (_request, response) => {
        try {
            const publicMetadata = this.publicServicesApplicationService.getPublicMetadata();
            return (0, http_response_factory_1.sendSuccessResponse)(response, publicMetadata);
        }
        catch (error) {
            return (0, http_response_factory_1.sendErrorResponse)(response, 'PUBLIC_SERVICES_METADATA_ERROR', error instanceof Error ? error.message : 'Erro inesperado.', 'Nao foi possivel consultar os metadados publicos.');
        }
    };
}
exports.PublicServicesHttpController = PublicServicesHttpController;
