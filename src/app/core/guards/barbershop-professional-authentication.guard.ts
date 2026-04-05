import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BarbershopProfessionalSessionService } from '../services/barbershop-professional-session.service';

export const barbershopProfessionalAuthenticationGuard: CanActivateFn = () => {
    const barbershopProfessionalSessionService = inject(
        BarbershopProfessionalSessionService
    );
    const router = inject(Router);

    if (barbershopProfessionalSessionService.isAuthenticated()) {
        return true;
    }

    void router.navigateByUrl('/barbearia');
    return false;
};
