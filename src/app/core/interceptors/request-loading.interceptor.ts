import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { RequestLoadingStateService } from '../services/request-loading-state.service';

export const requestLoadingInterceptor: HttpInterceptorFn = (request, next) => {
    const requestLoadingStateService = inject(RequestLoadingStateService);

    requestLoadingStateService.beginRequest();

    return next(request).pipe(
        finalize(() => {
            requestLoadingStateService.endRequest();
        })
    );
};
