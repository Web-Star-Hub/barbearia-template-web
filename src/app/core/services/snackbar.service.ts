import { Injectable, signal } from '@angular/core';

export interface SnackbarStateInterface {
    isVisible: boolean;
    message: string;
    tone: 'success' | 'error';
}

@Injectable({
    providedIn: 'root',
})
export class SnackbarService {
    private readonly snackbarStateSignal = signal<SnackbarStateInterface>({
        isVisible: false,
        message: '',
        tone: 'success',
    });
    private hideTimeoutId: ReturnType<typeof setTimeout> | null = null;

    public readonly snackbarState = this.snackbarStateSignal.asReadonly();

    public showSuccess(message: string): void {
        this.showSnackbar(message, 'success');
    }

    public showError(message: string): void {
        this.showSnackbar(message, 'error');
    }

    private showSnackbar(message: string, tone: 'success' | 'error'): void {
        this.snackbarStateSignal.set({
            isVisible: true,
            message,
            tone,
        });

        if (this.hideTimeoutId) {
            clearTimeout(this.hideTimeoutId);
        }

        this.hideTimeoutId = setTimeout(() => {
            this.snackbarStateSignal.set({
                isVisible: false,
                message: '',
                tone,
            });
            this.hideTimeoutId = null;
        }, 2800);
    }
}
