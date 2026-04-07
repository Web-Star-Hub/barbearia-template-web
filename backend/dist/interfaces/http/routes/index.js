"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiRouter = createApiRouter;
const express_1 = require("express");
const authentication_http_routes_1 = require("./authentication-http-routes");
const barbershop_location_discovery_http_routes_1 = require("./barbershop-location-discovery-http-routes");
const barbershop_panel_http_routes_1 = require("./barbershop-panel-http-routes");
const barbershop_registration_http_routes_1 = require("./barbershop-registration-http-routes");
const plans_http_routes_1 = require("./plans-http-routes");
const public_barbershop_read_http_routes_1 = require("./public-barbershop-read-http-routes");
const public_file_upload_http_routes_1 = require("./public-file-upload-http-routes");
const public_services_http_routes_1 = require("./public-services-http-routes");
function createApiRouter(applicationDependencies) {
    const apiRouter = (0, express_1.Router)();
    apiRouter.use('/public-file-uploads', (0, public_file_upload_http_routes_1.createPublicFileUploadHttpRoutes)());
    apiRouter.use('/barbershops', (0, public_barbershop_read_http_routes_1.createPublicBarbershopReadHttpRoutes)(applicationDependencies.barbershopPanelApplicationService));
    apiRouter.use('/public-services', (0, public_services_http_routes_1.createPublicServicesHttpRoutes)());
    apiRouter.use('/plans', (0, plans_http_routes_1.createPlansHttpRoutes)(applicationDependencies.plansApplicationService));
    apiRouter.use('/barbershop-registration', (0, barbershop_registration_http_routes_1.createBarbershopRegistrationHttpRoutes)(applicationDependencies.barbershopRegistrationApplicationService));
    apiRouter.use('/authentication', (0, authentication_http_routes_1.createAuthenticationHttpRoutes)(applicationDependencies.authenticationApplicationService));
    apiRouter.use('/barbershop-location-discovery', (0, barbershop_location_discovery_http_routes_1.createBarbershopLocationDiscoveryHttpRoutes)(applicationDependencies.barbershopLocationDiscoveryApplicationService));
    apiRouter.use('/barbershop-panel', (0, barbershop_panel_http_routes_1.createBarbershopPanelHttpRoutes)(applicationDependencies.barbershopPanelApplicationService));
    return apiRouter;
}
