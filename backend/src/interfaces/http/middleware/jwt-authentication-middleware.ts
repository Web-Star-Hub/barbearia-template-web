import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { environmentConfiguration } from '../../../infrastructure/config/environment-configuration';
import { sendErrorResponse } from '../shared/http-response-factory';

export type JwtBarbershopRequestContext = {
    userAccountIdentifier: string;
    barbershopIdentifier: string;
    role: string;
};

export type JwtAuthenticatedRequest = Request & {
    jwtBarbershopContext: JwtBarbershopRequestContext;
};

type AccessTokenPayload = jwt.JwtPayload & {
    userAccountIdentifier?: string;
    barbershopIdentifier?: string;
    role?: string;
};

export function jwtAuthenticationMiddleware(
    request: Request,
    response: Response,
    next: NextFunction
): void {
    const authorizationHeaderValue = request.headers.authorization;

    if (!authorizationHeaderValue || !authorizationHeaderValue.startsWith('Bearer ')) {
        sendErrorResponse(
            response,
            'AUTHENTICATION_REQUIRED',
            'Cabecalho Authorization Bearer ausente.',
            'Faca login novamente para acessar esta area.',
            401
        );
        return;
    }

    const accessToken = authorizationHeaderValue.slice('Bearer '.length).trim();

    if (!accessToken) {
        sendErrorResponse(
            response,
            'AUTHENTICATION_REQUIRED',
            'Token de acesso vazio.',
            'Faca login novamente para acessar esta area.',
            401
        );
        return;
    }

    try {
        const decodedPayload = jwt.verify(
            accessToken,
            environmentConfiguration.jwtSecret
        ) as AccessTokenPayload;

        const userAccountIdentifier = decodedPayload.userAccountIdentifier;
        const barbershopIdentifier = decodedPayload.barbershopIdentifier;
        const role = decodedPayload.role;

        if (!userAccountIdentifier || !barbershopIdentifier || !role) {
            sendErrorResponse(
                response,
                'AUTHENTICATION_INVALID_TOKEN',
                'Token de acesso sem contexto de usuario.',
                'Faca login novamente.',
                401
            );
            return;
        }

        (request as JwtAuthenticatedRequest).jwtBarbershopContext = {
            userAccountIdentifier,
            barbershopIdentifier,
            role,
        };

        next();
    } catch {
        sendErrorResponse(
            response,
            'AUTHENTICATION_INVALID_TOKEN',
            'Token de acesso invalido ou expirado.',
            'Faca login novamente.',
            401
        );
    }
}
