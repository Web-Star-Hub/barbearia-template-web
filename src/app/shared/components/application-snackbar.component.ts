import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../../core/services/snackbar.service';

@Component({
    selector: 'app-application-snackbar',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="snackbar-shell" *ngIf="snackbarState().isVisible">
            <div
                class="snackbar-content"
                [class.snackbar-content-error]="snackbarState().tone === 'error'"
            >
                {{ snackbarState().message }}
            </div>
        </div>
    `,
    styles: `
        .snackbar-shell {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 92px;
            display: flex;
            justify-content: center;
            z-index: 90;
            pointer-events: none;
        }

        .snackbar-content {
            min-width: 240px;
            max-width: 90vw;
            border-radius: 999px;
            padding: 12px 16px;
            font-weight: 700;
            color: #0c0c12;
            background: linear-gradient(135deg, #d4af37, #c8a964);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.36);
            text-align: center;
        }

        .snackbar-content-error {
            color: #ffffff;
            background: linear-gradient(135deg, #9a2020, #cf3f3f);
        }
    `,
})
export class ApplicationSnackbarComponent {
    private readonly snackbarService = inject(SnackbarService);

    protected readonly snackbarState = this.snackbarService.snackbarState;
}
