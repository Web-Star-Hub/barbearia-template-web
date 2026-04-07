"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlansHttpRoutes = createPlansHttpRoutes;
const express_1 = require("express");
const plans_http_controller_1 = require("../controllers/plans-http-controller");
function createPlansHttpRoutes(plansApplicationService) {
    const plansRouter = (0, express_1.Router)();
    const plansHttpController = new plans_http_controller_1.PlansHttpController(plansApplicationService);
    plansRouter.get('/', plansHttpController.listPlans);
    return plansRouter;
}
