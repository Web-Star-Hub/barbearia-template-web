import { Router } from 'express';
import { PublicServicesApplicationService } from '../../../application/services/public-services-application-service';
import { PublicServicesHttpController } from '../controllers/public-services-http-controller';

export function createPublicServicesHttpRoutes() {
    const publicServicesRouter = Router();
    const publicServicesApplicationService =
        new PublicServicesApplicationService();
    const publicServicesHttpController = new PublicServicesHttpController(
        publicServicesApplicationService
    );

    publicServicesRouter.get('/health', publicServicesHttpController.getHealth);
    publicServicesRouter.get('/metadata', publicServicesHttpController.getMetadata);

    return publicServicesRouter;
}
