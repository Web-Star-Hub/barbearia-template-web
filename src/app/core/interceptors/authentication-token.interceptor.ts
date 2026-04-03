import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthenticationStateService } from '../services/authentication-state.service';

export const authenticationTokenInterceptor: HttpInterceptorFn = (request, next) => {
    const authenticationStateService = inject(AuthenticationStateService);
    const accessToken = authenticationStateService.getAccessToken();

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
