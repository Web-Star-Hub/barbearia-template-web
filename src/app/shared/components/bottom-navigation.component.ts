import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgxFadeComponent } from '@omnedia/ngx-fade';
import { NgxShineBorderComponent } from '@omnedia/ngx-shine-border';

@Component({
    selector: 'app-bottom-navigation',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        RouterLinkActive,
        NgxFadeComponent,
        NgxShineBorderComponent,
    ],
    template: `
        <div class="bottom-navigation-shell">
            <om-fade direction="up">
                <om-shine-border class="bottom-navigation-shine-border">
                    <nav class="bottom-navigation">
                        <a
                            routerLink="/agendar"
                            routerLinkActive="active"
                            [routerLinkActiveOptions]="{ exact: true }"
                        >
                            Agendar
                        </a>
                        <a routerLink="/historico" routerLinkActive="active">Historico</a>
                        <a routerLink="/admin" routerLinkActive="active">Admin</a>
                    </nav>
                </om-shine-border>
            </om-fade>
        </div>
    `,
    styles: `
        .bottom-navigation-shell {
            position: fixed;
            bottom: 10px;
            left: 0;
            right: 0;
            z-index: 40;
            padding: 0 12px;
        }

        .bottom-navigation-shine-border {
            display: block;
            width: min(980px, 100%);
            margin: 0 auto;
            border-radius: 14px;
            overflow: hidden;
        }

        .bottom-navigation {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            background: linear-gradient(
                165deg,
                rgba(26, 26, 46, 0.95),
                rgba(15, 15, 26, 0.9)
            );
            backdrop-filter: blur(12px);
            overflow: hidden;
            border-radius: 14px;
        }

        a {
            text-align: center;
            text-decoration: none;
            color: var(--color-text-secondary);
            padding: 12px 10px;
            min-height: 46px;
            display: grid;
            place-items: center;
            font-weight: 600;
            font-size: 0.88rem;
            transition: color 0.2s ease, background-color 0.2s ease;
        }

        .active {
            color: var(--color-primary);
            background: rgba(200, 169, 100, 0.12);
        }

        @media (max-width: 640px) {
            .bottom-navigation-shell {
                bottom: 12px;
            }

            .bottom-navigation {
                min-height: 56px;
            }

            a {
                min-height: 56px;
                padding: 14px 10px;
                font-size: 1.06rem;
            }
        }
    `,
})
export class BottomNavigationComponent {}
