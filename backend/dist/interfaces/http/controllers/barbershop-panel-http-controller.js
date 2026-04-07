"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarbershopPanelHttpController = void 0;
const jwt_authentication_middleware_1 = require("../middleware/jwt-authentication-middleware");
const http_response_factory_1 = require("../shared/http-response-factory");
class BarbershopPanelHttpController {
    barbershopPanelApplicationService;
    constructor(barbershopPanelApplicationService) {
        this.barbershopPanelApplicationService = barbershopPanelApplicationService;
    }
    requireAuthentication = jwt_authentication_middleware_1.jwtAuthenticationMiddleware;
    getDashboardSummary = async (request, response) => {
        try {
            const jwtContext = request.jwtBarbershopContext;
            const summary = await this.barbershopPanelApplicationService.getDashboardSummary(jwtContext.barbershopIdentifier);
            return (0, http_response_factory_1.sendSuccessResponse)(response, summary);
        }
        catch (error) {
            return (0, http_response_factory_1.sendErrorResponse)(response, 'BARBERSHOP_PANEL_DASHBOARD_ERROR', error instanceof Error ? error.message : 'Erro inesperado.', 'Nao foi possivel carregar o painel.');
        }
    };
    getSubscriptionSummary = async (_request, response) => {
        try {
            const summary = await this.barbershopPanelApplicationService.getSubscriptionSummary();
            return (0, http_response_factory_1.sendSuccessResponse)(response, summary);
        }
        catch (error) {
            return (0, http_response_factory_1.sendErrorResponse)(response, 'BARBERSHOP_PANEL_SUBSCRIPTION_ERROR', error instanceof Error ? error.message : 'Erro inesperado.', 'Nao foi possivel carregar a assinatura.');
        }
    };
    getBarbershopTenantProfile = async (request, response) => {
        try {
            const jwtContext = request.jwtBarbershopContext;
            const tenantProfile = await this.barbershopPanelApplicationService.getBarbershopTenantProfile(jwtContext.barbershopIdentifier);
            return (0, http_response_factory_1.sendSuccessResponse)(response, tenantProfile);
        }
        catch (error) {
            return (0, http_response_factory_1.sendErrorResponse)(response, 'BARBERSHOP_PANEL_TENANT_ERROR', error instanceof Error ? error.message : 'Erro inesperado.', 'Nao foi possivel carregar os dados da barbearia.');
        }
    };
    listServiceOfferings = async (request, response) => {
        try {
            const jwtContext = request.jwtBarbershopContext;
            const items = await this.barbershopPanelApplicationService.listServiceOfferings(jwtContext.barbershopIdentifier);
            return (0, http_response_factory_1.sendSuccessResponse)(response, items);
        }
        catch (error) {
            return (0, http_response_factory_1.sendErrorResponse)(response, 'BARBERSHOP_PANEL_SERVICES_LIST_ERROR', error instanceof Error ? error.message : 'Erro inesperado.', 'Nao foi possivel listar os servicos.');
        }
    };
    createServiceOffering = async (request, response) => {
        try {
            const jwtContext = request.jwtBarbershopContext;
            const body = request.body;
            const created = await this.barbershopPanelApplicationService.createServiceOffering(jwtContext.barbershopIdentifier, {
                serviceName: body.serviceName,
                priceInCents: body.priceInCents,
                averageDurationInMinutes: body.averageDurationInMinutes,
            });
            return (0, http_response_factory_1.sendSuccessResponse)(response, created, 201);
        }
        catch (error) {
            return (0, http_response_factory_1.sendErrorResponse)(response, 'BARBERSHOP_PANEL_SERVICE_CREATE_ERROR', error instanceof Error ? error.message : 'Erro inesperado.', 'Nao foi possivel criar o servico.');
        }
    };
    deleteServiceOffering = async (request, response) => {
        try {
            const jwtContext = request.jwtBarbershopContext;
            const serviceOfferingId = request.params.serviceOfferingId;
            const result = await this.barbershopPanelApplicationService.deleteServiceOffering(jwtContext.barbershopIdentifier, serviceOfferingId);
            return (0, http_response_factory_1.sendSuccessResponse)(response, result);
        }
        catch (error) {
            return (0, http_response_factory_1.sendErrorResponse)(response, 'BARBERSHOP_PANEL_SERVICE_DELETE_ERROR', error instanceof Error ? error.message : 'Erro inesperado.', 'Nao foi possivel remover o servico.');
        }
    };
    listProfessionals = async (request, response) => {
        try {
            const jwtContext = request.jwtBarbershopContext;
            const items = await this.barbershopPanelApplicationService.listProfessionals(jwtContext.barbershopIdentifier);
            return (0, http_response_factory_1.sendSuccessResponse)(response, items);
        }
        catch (error) {
            return (0, http_response_factory_1.sendErrorResponse)(response, 'BARBERSHOP_PANEL_PROFESSIONALS_LIST_ERROR', error instanceof Error ? error.message : 'Erro inesperado.', 'Nao foi possivel listar os profissionais.');
        }
    };
    updateBarbershopTenantProfile = async (request, response) => {
        try {
            const jwtContext = request.jwtBarbershopContext;
            const body = request.body;
            const updated = await this.barbershopPanelApplicationService.updateBarbershopTenantProfile(jwtContext.barbershopIdentifier, body);
            return (0, http_response_factory_1.sendSuccessResponse)(response, updated);
        }
        catch (error) {
            return (0, http_response_factory_1.sendErrorResponse)(response, 'BARBERSHOP_PANEL_TENANT_UPDATE_ERROR', error instanceof Error ? error.message : 'Erro inesperado.', 'Nao foi possivel atualizar os dados da barbearia.');
        }
    };
    notImplementedProfessionalMutation = async (_request, response) => {
        return (0, http_response_factory_1.sendErrorResponse)(response, 'BARBERSHOP_PANEL_NOT_IMPLEMENTED', 'Operacao ainda nao implementada no servidor.', 'Esta acao ainda nao esta disponivel na API. Use o cadastro inicial para novos profissionais.', 501);
    };
}
exports.BarbershopPanelHttpController = BarbershopPanelHttpController;
