import { Router } from 'express';
import { ApplicationDependencies } from '../../../infrastructure/dependency-injection/application-dependencies';
import { createAuthenticationHttpRoutes } from './authentication-http-routes';
import { createBarbershopLocationDiscoveryHttpRoutes } from './barbershop-location-discovery-http-routes';
import { createBarbershopPanelHttpRoutes } from './barbershop-panel-http-routes';
import { createBarbershopRegistrationHttpRoutes } from './barbershop-registration-http-routes';
import { createPlansHttpRoutes } from './plans-http-routes';
import { createPublicBarbershopReadHttpRoutes } from './public-barbershop-read-http-routes';
import { createPublicFileUploadHttpRoutes } from './public-file-upload-http-routes';
import { createPublicServicesHttpRoutes } from './public-services-http-routes';

export function createApiRouter(applicationDependencies: ApplicationDependencies) {
    const apiRouter = Router();

    apiRouter.use('/public-file-uploads', createPublicFileUploadHttpRoutes());
    apiRouter.use(
        '/barbershops',
        createPublicBarbershopReadHttpRoutes(
            applicationDependencies.barbershopPanelApplicationService
        )
    );
    apiRouter.use('/public-services', createPublicServicesHttpRoutes());
    apiRouter.use(
        '/plans',
        createPlansHttpRoutes(applicationDependencies.plansApplicationService)
    );
    apiRouter.use(
        '/barbershop-registration',
        createBarbershopRegistrationHttpRoutes(
            applicationDependencies.barbershopRegistrationApplicationService
        )
    );
    apiRouter.use(
        '/authentication',
        createAuthenticationHttpRoutes(
            applicationDependencies.authenticationApplicationService
        )
    );
    apiRouter.use(
        '/barbershop-location-discovery',
        createBarbershopLocationDiscoveryHttpRoutes(
            applicationDependencies.barbershopLocationDiscoveryApplicationService
        )
    );
    apiRouter.use(
        '/barbershop-panel',
        createBarbershopPanelHttpRoutes(
            applicationDependencies.barbershopPanelApplicationService
        )
    );

    return apiRouter;
}
