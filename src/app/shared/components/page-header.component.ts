import { Component, signal } from '@angular/core';
import { businessConfiguration } from '../../core/configuration/business.configuration';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminAccessStateService } from '../../core/services/admin-access-state.service';

@Component({
    selector: 'app-page-header',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
        <header class="page-header-shell">
            <div class="page-header-shine-border">
                <div class="page-header">
                        <div class="page-header-primary-row">
                            <a
                                class="page-header-brand-link"
                                routerLink="/agendar"
                                [attr.aria-label]="
                                    'Ir para inicio de ' + configuration.businessName
                                "
                                (click)="closeMobileNavigationMenu()"
                            >
                                <div class="page-header-brand">
                                    <img
                                        class="page-header-logo"
                                        [src]="configuration.logoPath"
                                        [alt]="configuration.businessName"
                                    />
                                    <div class="page-header-text">
                                        <h1>{{ configuration.businessName }}</h1>
                                        <p>{{ configuration.businessSlogan }}</p>
                                    </div>
                                </div>
                            </a>
                            <button
                                type="button"
                                class="mobile-menu-toggle-button"
                                [attr.aria-expanded]="isMobileNavigationMenuVisible()"
                                aria-controls="page-header-actions-menu"
                                [attr.aria-label]="
                                    isMobileNavigationMenuVisible()
                                        ? 'Fechar menu de navegacao'
                                        : 'Abrir menu de navegacao'
                                "
                                (click)="toggleMobileNavigationMenuVisibility()"
                            >
                                <span class="mobile-menu-toggle-line"></span>
                                <span class="mobile-menu-toggle-line"></span>
                                <span class="mobile-menu-toggle-line"></span>
                            </button>
                        </div>
                        <div
                            class="page-header-actions"
                            id="page-header-actions-menu"
                            [class.page-header-actions-mobile-open]="
                                isMobileNavigationMenuVisible()
                            "
                        >
                            <a
                                class="action-link"
                                routerLink="/admin"
                                (click)="closeMobileNavigationMenu()"
                            >
                                Admin
                            </a>
                            <a
                                class="action-link"
                                [href]="configuration.instagramUrl"
                                target="_blank"
                                (click)="closeMobileNavigationMenu()"
                            >
                                Instagram
                            </a>
                            <button
                                type="button"
                                class="action-link action-button"
                                *ngIf="adminAccessStateService.hasAdminAccess()"
                                (click)="logoutAdminAccess()"
                            >
                                Sair
                            </button>
                        </div>
                </div>
            </div>
        </header>
    `,
    styles: `
        .page-header-shell {
            padding: 10px 12px 0;
        }

        .page-header-shine-border {
            display: block;
            width: min(980px, 100%);
            margin: 0 auto;
            border-radius: 14px;
            overflow: hidden;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            padding: 12px 14px;
            background: linear-gradient(
                170deg,
                rgba(255, 255, 255, 0.08),
                rgba(255, 255, 255, 0.02)
            );
            backdrop-filter: blur(12px);
            border-radius: 14px;
        }

        .page-header-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
        }

        .page-header-primary-row {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
            flex: 1;
        }

        .page-header-brand-link {
            text-decoration: none;
            color: inherit;
            border-radius: 10px;
            transition:
                transform 0.2s ease,
                opacity 0.2s ease;
            cursor: pointer;
            min-width: 0;
            flex: 1;
        }

        .page-header-brand-link:hover {
            transform: translateY(-1px);
            opacity: 0.95;
        }

        .page-header-brand-link:focus-visible {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
        }

        .page-header-text {
            min-width: 0;
        }

        .page-header-logo {
            width: 44px;
            height: 44px;
            border-radius: 999px;
            object-fit: cover;
            background: radial-gradient(
                circle,
                var(--color-primary),
                var(--color-surface)
            );
            border: 1px solid rgba(255, 255, 255, 0.24);
            padding: 4px;
        }

        h1 {
            margin: 0;
            font-size: 1rem;
            line-height: 1.2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        p {
            margin: 0;
            color: var(--color-text-secondary);
            font-size: 0.78rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .page-header-actions {
            display: flex;
            justify-content: flex-end;
            flex-wrap: wrap;
            gap: 8px;
        }

        .mobile-menu-toggle-button {
            display: none;
            border: 1px solid rgba(255, 255, 255, 0.26);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.04);
            width: 46px;
            height: 46px;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 8px;
            cursor: pointer;
        }

        .mobile-menu-toggle-line {
            display: block;
            width: 100%;
            max-width: 18px;
            height: 2px;
            border-radius: 999px;
            background: var(--color-text);
        }

        .action-link {
            text-decoration: none;
            color: var(--color-text);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 999px;
            padding: 10px 14px;
            min-height: 42px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.04);
            transition:
                border-color 0.2s ease,
                color 0.2s ease,
                transform 0.2s ease;
        }

        .action-button {
            cursor: pointer;
        }

        .action-link:hover {
            border-color: var(--color-primary);
            color: var(--color-primary);
            transform: translateY(-1px);
        }

        @media (max-width: 640px) {
            .page-header {
                align-items: stretch;
                padding: 12px 12px;
                flex-direction: column;
                gap: 10px;
            }

            .page-header-primary-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                width: 100%;
            }

            .mobile-menu-toggle-button {
                display: inline-flex;
                flex-shrink: 0;
                width: 50px;
                height: 50px;
                border-radius: 12px;
                margin-right: 2px;
            }

            .page-header-actions {
                display: none;
                flex-direction: column;
                align-items: stretch;
                gap: 10px;
                justify-content: flex-start;
            }

            .page-header-actions-mobile-open {
                display: flex;
            }

            .action-link {
                width: 100%;
                min-height: 48px;
                font-size: 0.92rem;
                padding: 12px 14px;
            }

            .page-header-brand-link {
                flex: 1;
                min-width: 0;
                padding-right: 4px;
            }

            .page-header-brand {
                width: 100%;
            }
        }
    `,
})
export class PageHeaderComponent {
    protected readonly configuration = businessConfiguration;
    protected readonly isMobileNavigationMenuVisible = signal(false);

    constructor(
        protected readonly adminAccessStateService: AdminAccessStateService,
        private readonly router: Router
    ) {}

    protected logoutAdminAccess(): void {
        this.closeMobileNavigationMenu();
        this.adminAccessStateService.clearAdminAccessKey();
        this.router.navigateByUrl('/admin-access');
    }

    protected toggleMobileNavigationMenuVisibility(): void {
        this.isMobileNavigationMenuVisible.update(
            (isMobileNavigationMenuVisible) => !isMobileNavigationMenuVisible
        );
    }

    protected closeMobileNavigationMenu(): void {
        this.isMobileNavigationMenuVisible.set(false);
    }
}
