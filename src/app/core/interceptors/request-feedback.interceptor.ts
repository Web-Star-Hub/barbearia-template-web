import { HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { SnackbarService } from '../services/snackbar.service';

export const requestFeedbackInterceptor: HttpInterceptorFn = (request, next) => {
    const snackbarService = inject(SnackbarService);
    const shouldShowSnackbar = ['POST', 'PUT', 'PATCH'].includes(request.method);

    return next(request).pipe(
        tap((event) => {
            if (!shouldShowSnackbar || event.type !== HttpEventType.Response) {
                return;
            }

            const requestFeedbackMessage =
                request.method === 'POST'
                    ? 'Cadastro realizado com sucesso.'
                    : 'Atualizacao realizada com sucesso.';

            snackbarService.showSuccess(requestFeedbackMessage);
        })
    );
};
