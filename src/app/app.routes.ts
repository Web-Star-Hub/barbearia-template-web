import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginPageComponent } from './features/authentication/pages/login-page.component';
import { RegisterPageComponent } from './features/authentication/pages/register-page.component';
import { ForgotPasswordPageComponent } from './features/authentication/pages/forgot-password-page.component';
import { ServiceCatalogPageComponent } from './features/service-catalog/pages/service-catalog-page.component';
import { SchedulingPageComponent } from './features/scheduling/pages/scheduling-page.component';
import { BookingHistoryPageComponent } from './features/booking-history/pages/booking-history-page.component';
import { AdminAccessPageComponent } from './features/admin/pages/admin-access-page.component';
import { AdminManagementPageComponent } from './features/admin/pages/admin-management-page.component';
import { adminPanelGuard } from './core/guards/admin-panel.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginPageComponent,
    },
    {
        path: 'register',
        component: RegisterPageComponent,
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordPageComponent,
    },
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: 'agendar',
                component: ServiceCatalogPageComponent,
            },
            {
                path: 'agendamento',
                component: SchedulingPageComponent,
            },
            {
                path: 'historico',
                component: BookingHistoryPageComponent,
            },
            {
                path: 'admin',
                component: AdminManagementPageComponent,
                canActivate: [adminPanelGuard],
            },
            {
                path: 'admin-access',
                component: AdminAccessPageComponent,
            },
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'agendar',
            },
        ],
    },
    {
        path: '**',
        redirectTo: '',
    },
];
