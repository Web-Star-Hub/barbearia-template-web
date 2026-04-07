"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtAuthenticationMiddleware = jwtAuthenticationMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_configuration_1 = require("../../../infrastructure/config/environment-configuration");
const http_response_factory_1 = require("../shared/http-response-factory");
function jwtAuthenticationMiddleware(request, response, next) {
    const authorizationHeaderValue = request.headers.authorization;
    if (!authorizationHeaderValue || !authorizationHeaderValue.startsWith('Bearer ')) {
        (0, http_response_factory_1.sendErrorResponse)(response, 'AUTHENTICATION_REQUIRED', 'Cabecalho Authorization Bearer ausente.', 'Faca login novamente para acessar esta area.', 401);
        return;
    }
    const accessToken = authorizationHeaderValue.slice('Bearer '.length).trim();
    if (!accessToken) {
        (0, http_response_factory_1.sendErrorResponse)(response, 'AUTHENTICATION_REQUIRED', 'Token de acesso vazio.', 'Faca login novamente para acessar esta area.', 401);
        return;
    }
    try {
        const decodedPayload = jsonwebtoken_1.default.verify(accessToken, environment_configuration_1.environmentConfiguration.jwtSecret);
        const userAccountIdentifier = decodedPayload.userAccountIdentifier;
        const barbershopIdentifier = decodedPayload.barbershopIdentifier;
        const role = decodedPayload.role;
        if (!userAccountIdentifier || !barbershopIdentifier || !role) {
            (0, http_response_factory_1.sendErrorResponse)(response, 'AUTHENTICATION_INVALID_TOKEN', 'Token de acesso sem contexto de usuario.', 'Faca login novamente.', 401);
            return;
        }
        request.jwtBarbershopContext = {
            userAccountIdentifier,
            barbershopIdentifier,
            role,
        };
        next();
    }
    catch {
        (0, http_response_factory_1.sendErrorResponse)(response, 'AUTHENTICATION_INVALID_TOKEN', 'Token de acesso invalido ou expirado.', 'Faca login novamente.', 401);
    }
}
