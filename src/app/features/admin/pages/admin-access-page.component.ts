import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAccessStateService } from '../../../core/services/admin-access-state.service';

@Component({
    selector: 'app-admin-access-page',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <section class="admin-access-shell">
            <div class="admin-access-card">
                <h2>Acesso administrativo</h2>
                <p>
                    Informe o codigo administrativo para desbloquear o painel.
                </p>
                <label>
                    Codigo administrativo
                    <input
                        type="password"
                        [ngModel]="adminAccessKeyInput()"
                        (ngModelChange)="adminAccessKeyInput.set($event)"
                    />
                </label>
                <button type="button" (click)="authenticateAdminAccess()">
                    Entrar no painel
                </button>
                <span class="admin-access-feedback" *ngIf="feedbackMessage()">
                    {{ feedbackMessage() }}
                </span>
            </div>
        </section>
    `,
    styles: `
        .admin-access-shell {
            min-height: calc(100vh - 220px);
            display: grid;
            align-items: center;
            width: 100%;
            max-width: 460px;
            margin: 0 auto;
        }

        .admin-access-card {
            display: grid;
            gap: 10px;
            padding: 16px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            background: linear-gradient(
                170deg,
                rgba(255, 255, 255, 0.06),
                rgba(255, 255, 255, 0.02)
            );
        }

        h2,
        p {
            margin: 0;
        }

        p {
            color: var(--color-text-secondary);
        }

        label {
            display: grid;
            gap: 6px;
        }

        input,
        button {
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 10px;
            background: var(--color-surface);
            color: var(--color-text);
            padding: 10px;
        }

        button {
            border: none;
            cursor: pointer;
            font-weight: 700;
            color: #141414;
            background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
        }

        .admin-access-feedback {
            color: #ffb1b1;
            font-weight: 600;
        }
    `,
})
export class AdminAccessPageComponent {
    private readonly adminAccessStateService = inject(AdminAccessStateService);
    private readonly router = inject(Router);

    protected readonly adminAccessKeyInput = signal('');
    protected readonly feedbackMessage = signal('');

    protected authenticateAdminAccess(): void {
        this.feedbackMessage.set('');
        this.adminAccessStateService
            .validateAdminAccessKey(this.adminAccessKeyInput())
            .subscribe((isAdminAccessValid) => {
                if (!isAdminAccessValid) {
                    this.feedbackMessage.set('Codigo administrativo invalido.');
                    return;
                }

                this.adminAccessStateService.setAdminAccessKey(
                    this.adminAccessKeyInput()
                );
                this.router.navigateByUrl('/admin');
            });
    }
}
