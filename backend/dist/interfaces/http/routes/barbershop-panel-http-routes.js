"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBarbershopPanelHttpRoutes = createBarbershopPanelHttpRoutes;
const express_1 = require("express");
const barbershop_panel_http_controller_1 = require("../controllers/barbershop-panel-http-controller");
function createBarbershopPanelHttpRoutes(barbershopPanelApplicationService) {
    const barbershopPanelRouter = (0, express_1.Router)();
    const barbershopPanelHttpController = new barbershop_panel_http_controller_1.BarbershopPanelHttpController(barbershopPanelApplicationService);
    const authenticate = barbershopPanelHttpController.requireAuthentication;
    barbershopPanelRouter.get('/dashboard-summary', authenticate, barbershopPanelHttpController.getDashboardSummary);
    barbershopPanelRouter.get('/subscription-summary', authenticate, barbershopPanelHttpController.getSubscriptionSummary);
    barbershopPanelRouter.get('/barbershop-tenant-profile', authenticate, barbershopPanelHttpController.getBarbershopTenantProfile);
    barbershopPanelRouter.get('/service-offerings', authenticate, barbershopPanelHttpController.listServiceOfferings);
    barbershopPanelRouter.post('/service-offerings', authenticate, barbershopPanelHttpController.createServiceOffering);
    barbershopPanelRouter.delete('/service-offerings/:serviceOfferingId', authenticate, barbershopPanelHttpController.deleteServiceOffering);
    barbershopPanelRouter.get('/professionals', authenticate, barbershopPanelHttpController.listProfessionals);
    barbershopPanelRouter.patch('/barbershop-tenant-profile', authenticate, barbershopPanelHttpController.updateBarbershopTenantProfile);
    barbershopPanelRouter.post('/professionals/:professionalId/regenerate-password', authenticate, barbershopPanelHttpController.notImplementedProfessionalMutation);
    barbershopPanelRouter.patch('/professionals/:professionalId', authenticate, barbershopPanelHttpController.notImplementedProfessionalMutation);
    barbershopPanelRouter.post('/professionals', authenticate, barbershopPanelHttpController.notImplementedProfessionalMutation);
    barbershopPanelRouter.post('/primary-administrator', authenticate, barbershopPanelHttpController.notImplementedProfessionalMutation);
    return barbershopPanelRouter;
}
