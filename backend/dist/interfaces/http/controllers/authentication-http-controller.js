"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationHttpController = void 0;
const http_response_factory_1 = require("../shared/http-response-factory");
class AuthenticationHttpController {
    authenticationApplicationService;
    constructor(authenticationApplicationService) {
        this.authenticationApplicationService = authenticationApplicationService;
    }
    login = async (request, response) => {
        try {
            const { email, password } = request.body;
            const authenticationResult = await this.authenticationApplicationService.login({
                email,
                password,
            });
            return (0, http_response_factory_1.sendSuccessResponse)(response, authenticationResult);
        }
        catch (error) {
            return (0, http_response_factory_1.sendErrorResponse)(response, 'AUTHENTICATION_LOGIN_ERROR', error instanceof Error ? error.message : 'Erro inesperado.', 'Nao foi possivel autenticar o usuario.');
        }
    };
}
exports.AuthenticationHttpController = AuthenticationHttpController;
