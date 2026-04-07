"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApplication = createApplication;
const express_1 = __importDefault(require("express"));
const node_path_1 = require("node:path");
const environment_configuration_1 = require("./infrastructure/config/environment-configuration");
const cors_configuration_factory_1 = require("./infrastructure/http/cors-configuration-factory");
const routes_1 = require("./interfaces/http/routes");
function createApplication(applicationDependencies) {
    const application = (0, express_1.default)();
    const publicUploadsDirectoryPath = (0, node_path_1.resolve)(process.cwd(), 'uploads');
    application.use((0, cors_configuration_factory_1.createCorsMiddleware)(environment_configuration_1.environmentConfiguration.corsAllowedOrigins));
    application.use('/uploads', express_1.default.static(publicUploadsDirectoryPath));
    application.use(express_1.default.json({ limit: '1mb' }));
    application.use('/api/v1', (0, routes_1.createApiRouter)(applicationDependencies));
    return application;
}
