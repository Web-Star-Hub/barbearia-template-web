import { Router } from 'express';
import { BarbershopRegistrationApplicationService } from '../../../application/services/barbershop-registration-application-service';
import { BarbershopRegistrationHttpController } from '../controllers/barbershop-registration-http-controller';

export function createBarbershopRegistrationHttpRoutes(
    barbershopRegistrationApplicationService: BarbershopRegistrationApplicationService
) {
    const barbershopRegistrationRouter = Router();
    const barbershopRegistrationHttpController =
        new BarbershopRegistrationHttpController(
            barbershopRegistrationApplicationService
        );

    barbershopRegistrationRouter.post(
        '/',
        barbershopRegistrationHttpController.register
    );

    return barbershopRegistrationRouter;
}
