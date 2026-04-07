"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationApplicationService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_configuration_1 = require("../../infrastructure/config/environment-configuration");
class AuthenticationApplicationService {
    userAccountRepository;
    constructor(userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }
    async login(input) {
        const userAccount = await this.userAccountRepository.findByEmail(input.email);
        if (!userAccount) {
            throw new Error('Credenciais inválidas.');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(input.password, userAccount.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Credenciais inválidas.');
        }
        const accessToken = jsonwebtoken_1.default.sign({
            userAccountIdentifier: userAccount.identifier,
            role: userAccount.role,
            barbershopIdentifier: userAccount.barbershopIdentifier,
        }, environment_configuration_1.environmentConfiguration.jwtSecret, {
            expiresIn: environment_configuration_1.environmentConfiguration.jwtExpirationTime,
        });
        return {
            accessToken,
            tokenType: 'Bearer',
            expiresIn: environment_configuration_1.environmentConfiguration.jwtExpirationTime,
            authenticatedUser: {
                userAccountIdentifier: userAccount.identifier,
                email: userAccount.email,
                fullName: userAccount.fullName,
                barbershopIdentifier: userAccount.barbershopIdentifier,
                role: userAccount.role,
            },
        };
    }
}
exports.AuthenticationApplicationService = AuthenticationApplicationService;
