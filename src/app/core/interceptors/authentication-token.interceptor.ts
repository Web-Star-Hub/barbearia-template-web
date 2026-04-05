import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthenticationStateService } from '../services/authentication-state.service';
import { BarbershopProfessionalSessionService } from '../services/barbershop-professional-session.service';

export const authenticationTokenInterceptor: HttpInterceptorFn = (request, next) => {
    if (request.headers.has('Authorization')) {
        return next(request);
    }

    const authenticationStateService = inject(AuthenticationStateService);
    const barbershopProfessionalSessionService = inject(
        BarbershopProfessionalSessionService
    );

    const usesBarbershopProfessionalToken = request.url.includes(
        '/saas/barbershop-panel'
    );
    const accessToken = usesBarbershopProfessionalToken
        ? barbershopProfessionalSessionService.getAccessToken()
        : authenticationStateService.getAccessToken();

    if (!accessToken) {
        return next(request);
    }

    return next(
        request.clone({
            setHeaders: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
    );
};
