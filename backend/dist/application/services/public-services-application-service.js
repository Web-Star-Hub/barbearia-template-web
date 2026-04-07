"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicServicesApplicationService = void 0;
class PublicServicesApplicationService {
    getHealthStatus() {
        return {
            status: 'ok',
            service: 'barbearia-template-backend',
            timestamp: new Date().toISOString(),
        };
    }
    getPublicMetadata() {
        return {
            apiVersion: 'v1',
            availableModules: [
                'plans',
                'barbershop-registration',
                'authentication',
                'barbershop-location-discovery',
                'public-services',
            ],
        };
    }
}
exports.PublicServicesApplicationService = PublicServicesApplicationService;
