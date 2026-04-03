import { Injectable } from '@angular/core';
import { businessConfiguration } from '../configuration/business.configuration';

@Injectable({
    providedIn: 'root',
})
export class ThemeInitializerService {
    public initializeThemeVariables(): void {
        const rootElement = document.documentElement;
        rootElement.style.setProperty(
            '--color-primary',
            businessConfiguration.theme.primaryColor
        );
        rootElement.style.setProperty(
            '--color-secondary',
            businessConfiguration.theme.secondaryColor
        );
        rootElement.style.setProperty(
            '--color-background',
            businessConfiguration.theme.backgroundColor
        );
        rootElement.style.setProperty(
            '--color-surface',
            businessConfiguration.theme.surfaceColor
        );
        rootElement.style.setProperty('--color-text', businessConfiguration.theme.textColor);
        rootElement.style.setProperty(
            '--color-text-secondary',
            businessConfiguration.theme.textSecondaryColor
        );
        rootElement.style.setProperty('--color-accent', businessConfiguration.theme.accentColor);
        rootElement.style.setProperty(
            '--font-family-base',
            businessConfiguration.theme.fontFamily
        );
    }
}
