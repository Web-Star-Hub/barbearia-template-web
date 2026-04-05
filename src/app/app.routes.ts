import { Routes } from '@angular/router';
import { barbershopProfessionalAuthenticationGuard } from './core/guards/barbershop-professional-authentication.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./features/barbershop-saas/pages/landing-page.component').then(
                (module) => module.LandingPageComponent
            ),
    },
    {
        path: 'cliente',
        loadComponent: () =>
            import('./features/barbershop-saas/pages/client-discovery-page.component').then(
                (module) => module.ClientDiscoveryPageComponent
            ),
    },
    {
        path: 'cadastro',
        loadComponent: () =>
            import('./features/barbershop-saas/pages/subscription-wizard-page.component').then(
                (module) => module.SubscriptionWizardPageComponent
            ),
    },
    {
        path: 'barbearia',
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./features/barbershop-saas/pages/barbershop-professional-login-page.component').then(
                        (module) => module.BarbershopProfessionalLoginPageComponent
                    ),
            },
            {
                path: 'painel',
                canActivate: [barbershopProfessionalAuthenticationGuard],
                loadComponent: () =>
                    import('./features/barbershop-saas/pages/barbershop-panel-shell.component').then(
                        (module) => module.BarbershopPanelShellComponent
                    ),
            },
        ],
    },
    {
        path: '**',
        redirectTo: '',
    },
];
