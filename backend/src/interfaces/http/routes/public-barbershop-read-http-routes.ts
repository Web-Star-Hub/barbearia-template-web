import { Router } from 'express';
import { BarbershopPanelApplicationService } from '../../../application/services/barbershop-panel-application-service';
import { PublicBarbershopReadHttpController } from '../controllers/public-barbershop-read-http-controller';

export function createPublicBarbershopReadHttpRoutes(
    barbershopPanelApplicationService: BarbershopPanelApplicationService
) {
    const publicBarbershopReadRouter = Router();
    const publicBarbershopReadHttpController = new PublicBarbershopReadHttpController(
        barbershopPanelApplicationService
    );

    publicBarbershopReadRouter.get(
        '/:barbershopIdentifier/public-service-offerings',
        publicBarbershopReadHttpController.listPublicServiceOfferings
    );

    return publicBarbershopReadRouter;
}
