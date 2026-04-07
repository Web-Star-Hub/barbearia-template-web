"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBarbershopLocationDiscoveryHttpRoutes = createBarbershopLocationDiscoveryHttpRoutes;
const express_1 = require("express");
const barbershop_location_discovery_http_controller_1 = require("../controllers/barbershop-location-discovery-http-controller");
function createBarbershopLocationDiscoveryHttpRoutes(barbershopLocationDiscoveryApplicationService) {
    const barbershopLocationDiscoveryRouter = (0, express_1.Router)();
    const barbershopLocationDiscoveryHttpController = new barbershop_location_discovery_http_controller_1.BarbershopLocationDiscoveryHttpController(barbershopLocationDiscoveryApplicationService);
    barbershopLocationDiscoveryRouter.get('/', barbershopLocationDiscoveryHttpController.discoverByLocation);
    return barbershopLocationDiscoveryRouter;
}
