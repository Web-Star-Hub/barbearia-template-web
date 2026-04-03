import { Injectable, computed, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class RequestLoadingStateService {
    private readonly pendingRequestCountSignal = signal(0);

    public readonly isLoading = computed(
        () => this.pendingRequestCountSignal() > 0
    );

    public beginRequest(): void {
        this.pendingRequestCountSignal.update(
            (pendingRequestCount) => pendingRequestCount + 1
        );
    }

    public endRequest(): void {
        this.pendingRequestCountSignal.update((pendingRequestCount) =>
            Math.max(0, pendingRequestCount - 1)
        );
    }
}
