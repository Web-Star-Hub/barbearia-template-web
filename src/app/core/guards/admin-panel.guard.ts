import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AdminAccessStateService } from '../services/admin-access-state.service';

export const adminPanelGuard: CanActivateFn = () => {
    const adminAccessStateService = inject(AdminAccessStateService);
    const router = inject(Router);

    return adminAccessStateService.validateStoredAdminSession().pipe(
        map((isAdminSessionValid) => {
            if (isAdminSessionValid) {
                return true;
            }
            adminAccessStateService.clearAdminAccessKey();
            return router.createUrlTree(['/admin-access']);
        })
    );
};
