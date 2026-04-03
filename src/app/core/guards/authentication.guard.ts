import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationStateService } from '../services/authentication-state.service';

export const authenticationGuard: CanActivateFn = () => {
    const authenticationStateService = inject(AuthenticationStateService);
    const router = inject(Router);

    if (authenticationStateService.isAuthenticated()) {
        return true;
    }

    return router.createUrlTree(['/login']);
};
