export class PublicServicesApplicationService {
    public getHealthStatus() {
        return {
            status: 'ok',
            service: 'barbearia-template-backend',
            timestamp: new Date().toISOString(),
        };
    }

    public getPublicMetadata() {
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
