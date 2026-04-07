"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthenticationHttpRoutes = createAuthenticationHttpRoutes;
const express_1 = require("express");
const authentication_http_controller_1 = require("../controllers/authentication-http-controller");
function createAuthenticationHttpRoutes(authenticationApplicationService) {
    const authenticationRouter = (0, express_1.Router)();
    const authenticationHttpController = new authentication_http_controller_1.AuthenticationHttpController(authenticationApplicationService);
    authenticationRouter.post('/login', authenticationHttpController.login);
    return authenticationRouter;
}
