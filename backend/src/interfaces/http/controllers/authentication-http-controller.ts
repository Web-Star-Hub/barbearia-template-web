import { Request, Response } from 'express';
import { AuthenticationApplicationService } from '../../../application/services/authentication-application-service';
import {
    sendErrorResponse,
    sendSuccessResponse,
} from '../shared/http-response-factory';

export class AuthenticationHttpController {
    constructor(
        private readonly authenticationApplicationService: AuthenticationApplicationService
    ) {}

    public login = async (request: Request, response: Response) => {
        try {
            const { email, password } = request.body as {
                email: string;
                password: string;
            };

            const authenticationResult =
                await this.authenticationApplicationService.login({
                    email,
                    password,
                });

            return sendSuccessResponse(response, authenticationResult);
        } catch (error) {
            return sendErrorResponse(
                response,
                'AUTHENTICATION_LOGIN_ERROR',
                error instanceof Error ? error.message : 'Erro inesperado.',
                'Nao foi possivel autenticar o usuario.'
            );
        }
    };
}
