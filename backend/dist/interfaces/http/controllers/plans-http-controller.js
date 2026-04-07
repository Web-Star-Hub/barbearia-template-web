"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlansHttpController = void 0;
const http_response_factory_1 = require("../shared/http-response-factory");
class PlansHttpController {
    plansApplicationService;
    constructor(plansApplicationService) {
        this.plansApplicationService = plansApplicationService;
    }
    listPlans = async (_request, response) => {
        try {
            const availablePlans = await this.plansApplicationService.listAvailablePlans();
            return (0, http_response_factory_1.sendSuccessResponse)(response, availablePlans);
        }
        catch (error) {
            return (0, http_response_factory_1.sendErrorResponse)(response, 'PLANS_LIST_ERROR', error instanceof Error ? error.message : 'Erro inesperado.', 'Nao foi possivel listar os planos.');
        }
    };
}
exports.PlansHttpController = PlansHttpController;
