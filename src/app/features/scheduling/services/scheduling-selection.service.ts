import { Injectable, signal } from '@angular/core';
import { ServiceCatalogItemInterface } from '../../../core/models/domain.models';

@Injectable({
    providedIn: 'root',
})
export class SchedulingSelectionService {
    private readonly selectedServiceSignal = signal<ServiceCatalogItemInterface | null>(null);

    public readonly selectedService = this.selectedServiceSignal.asReadonly();

    public setSelectedService(serviceCatalogItem: ServiceCatalogItemInterface): void {
        this.selectedServiceSignal.set(serviceCatalogItem);
    }
}
