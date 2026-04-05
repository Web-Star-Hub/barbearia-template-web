import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RequestLoadingStateService } from '../../core/services/request-loading-state.service';

@Component({
    selector: 'app-application-loading-overlay',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div *ngIf="isLoading()">
            <div class="loading-overlay-shell">
                <div class="loading-overlay-card">
                    <span class="loading-spinner"></span>
                    <p>Carregando...</p>
                </div>
            </div>
        </div>
    `,
    styles: `
        .loading-overlay-shell {
            position: fixed;
            inset: 0;
            z-index: 200;
            display: grid;
            place-items: center;
            background: rgba(7, 7, 12, 0.52);
            backdrop-filter: blur(4px);
        }

        .loading-overlay-card {
            min-width: 180px;
            display: grid;
            justify-items: center;
            gap: 10px;
            padding: 16px 18px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.22);
            background: linear-gradient(
                170deg,
                rgba(255, 255, 255, 0.12),
                rgba(255, 255, 255, 0.04)
            );
        }

        .loading-spinner {
            width: 30px;
            height: 30px;
            border-radius: 999px;
            border: 3px solid rgba(255, 255, 255, 0.25);
            border-top-color: var(--color-primary);
            animation: loadingSpin 0.8s linear infinite;
        }

        p {
            margin: 0;
            font-weight: 700;
            color: var(--color-text);
        }

        @keyframes loadingSpin {
            to {
                transform: rotate(360deg);
            }
        }
    `,
})
export class ApplicationLoadingOverlayComponent {
    private readonly requestLoadingStateService = inject(RequestLoadingStateService);

    protected readonly isLoading = this.requestLoadingStateService.isLoading;
}
