"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPublicBarbershopReadHttpRoutes = createPublicBarbershopReadHttpRoutes;
const express_1 = require("express");
const public_barbershop_read_http_controller_1 = require("../controllers/public-barbershop-read-http-controller");
function createPublicBarbershopReadHttpRoutes(barbershopPanelApplicationService) {
    const publicBarbershopReadRouter = (0, express_1.Router)();
    const publicBarbershopReadHttpController = new public_barbershop_read_http_controller_1.PublicBarbershopReadHttpController(barbershopPanelApplicationService);
    publicBarbershopReadRouter.get('/:barbershopIdentifier/public-service-offerings', publicBarbershopReadHttpController.listPublicServiceOfferings);
    return publicBarbershopReadRouter;
}
