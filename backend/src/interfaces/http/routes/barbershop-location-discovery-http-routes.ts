import { Router } from 'express';
import { BarbershopLocationDiscoveryApplicationService } from '../../../application/services/barbershop-location-discovery-application-service';
import { BarbershopLocationDiscoveryHttpController } from '../controllers/barbershop-location-discovery-http-controller';

export function createBarbershopLocationDiscoveryHttpRoutes(
    barbershopLocationDiscoveryApplicationService: BarbershopLocationDiscoveryApplicationService
) {
    const barbershopLocationDiscoveryRouter = Router();
    const barbershopLocationDiscoveryHttpController =
        new BarbershopLocationDiscoveryHttpController(
            barbershopLocationDiscoveryApplicationService
        );

    barbershopLocationDiscoveryRouter.get(
        '/',
        barbershopLocationDiscoveryHttpController.discoverByLocation
    );

    return barbershopLocationDiscoveryRouter;
}
