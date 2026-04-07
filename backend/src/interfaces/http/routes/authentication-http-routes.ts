import { Router } from 'express';
import { AuthenticationApplicationService } from '../../../application/services/authentication-application-service';
import { AuthenticationHttpController } from '../controllers/authentication-http-controller';

export function createAuthenticationHttpRoutes(
    authenticationApplicationService: AuthenticationApplicationService
) {
    const authenticationRouter = Router();
    const authenticationHttpController = new AuthenticationHttpController(
        authenticationApplicationService
    );

    authenticationRouter.post('/login', authenticationHttpController.login);

    return authenticationRouter;
}
