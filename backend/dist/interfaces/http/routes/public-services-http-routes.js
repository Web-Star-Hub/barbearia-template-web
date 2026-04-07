"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPublicServicesHttpRoutes = createPublicServicesHttpRoutes;
const express_1 = require("express");
const public_services_application_service_1 = require("../../../application/services/public-services-application-service");
const public_services_http_controller_1 = require("../controllers/public-services-http-controller");
function createPublicServicesHttpRoutes() {
    const publicServicesRouter = (0, express_1.Router)();
    const publicServicesApplicationService = new public_services_application_service_1.PublicServicesApplicationService();
    const publicServicesHttpController = new public_services_http_controller_1.PublicServicesHttpController(publicServicesApplicationService);
    publicServicesRouter.get('/health', publicServicesHttpController.getHealth);
    publicServicesRouter.get('/metadata', publicServicesHttpController.getMetadata);
    return publicServicesRouter;
}
