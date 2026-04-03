import {
    ApplicationConfig,
    LOCALE_ID,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { authenticationTokenInterceptor } from './core/interceptors/authentication-token.interceptor';
import { requestFeedbackInterceptor } from './core/interceptors/request-feedback.interceptor';
import { requestLoadingInterceptor } from './core/interceptors/request-loading.interceptor';
import { ThemeInitializerService } from './core/services/theme-initializer.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(
            withInterceptors([
                requestLoadingInterceptor,
                authenticationTokenInterceptor,
                requestFeedbackInterceptor,
            ])
        ),
        {
            provide: LOCALE_ID,
            useValue: 'pt-BR',
        },
        provideAppInitializer(() => {
            const themeInitializerService = new ThemeInitializerService();
            themeInitializerService.initializeThemeVariables();
        }),
    ],
};
