import { Router } from 'express';
import { PlansApplicationService } from '../../../application/services/plans-application-service';
import { PlansHttpController } from '../controllers/plans-http-controller';

export function createPlansHttpRoutes(
    plansApplicationService: PlansApplicationService
) {
    const plansRouter = Router();
    const plansHttpController = new PlansHttpController(plansApplicationService);

    plansRouter.get('/', plansHttpController.listPlans);

    return plansRouter;
}
