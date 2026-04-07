"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBarbershopRegistrationHttpRoutes = createBarbershopRegistrationHttpRoutes;
const express_1 = require("express");
const barbershop_registration_http_controller_1 = require("../controllers/barbershop-registration-http-controller");
function createBarbershopRegistrationHttpRoutes(barbershopRegistrationApplicationService) {
    const barbershopRegistrationRouter = (0, express_1.Router)();
    const barbershopRegistrationHttpController = new barbershop_registration_http_controller_1.BarbershopRegistrationHttpController(barbershopRegistrationApplicationService);
    barbershopRegistrationRouter.post('/', barbershopRegistrationHttpController.register);
    return barbershopRegistrationRouter;
}
