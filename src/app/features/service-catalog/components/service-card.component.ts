import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ServiceCatalogItemInterface } from '../../../core/models/domain.models';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';

@Component({
    selector: 'app-service-card',
    standalone: true,
    imports: [CurrencyBrlPipe],
    template: `
        <article class="service-card">
            <h3>{{ serviceCatalogItem.serviceName }}</h3>
            <p>{{ serviceCatalogItem.priceInCents | currencyBrl }}</p>
            <small>{{ serviceCatalogItem.estimatedDurationInMinutes }} min</small>
            <button type="button" (click)="selectService.emit(serviceCatalogItem)">
                Agendar
            </button>
        </article>
    `,
    styles: `
        .service-card {
            display: grid;
            gap: 10px;
            padding: 18px;
            background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.08),
                rgba(255, 255, 255, 0.02)
            );
            border-radius: 16px;
            transition: transform 0.2s ease, border-color 0.2s ease;
            border: 1px solid rgba(212, 175, 55, 0.45);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }

        .service-card:hover {
            transform: translateY(-2px);
            border-color: rgba(200, 169, 100, 0.6);
        }

        h3,
        p {
            margin: 0;
        }

        p {
            color: var(--color-primary);
            font-weight: 700;
        }

        small {
            color: var(--color-text-secondary);
        }

        button {
            border: none;
            border-radius: 10px;
            padding: 10px;
            background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
            color: #1a1a1a;
            font-weight: 700;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        button:hover {
            transform: translateY(-1px);
        }
    `,
})
export class ServiceCardComponent {
    @Input({ required: true })
    public serviceCatalogItem!: ServiceCatalogItemInterface;

    @Output()
    public readonly selectService = new EventEmitter<ServiceCatalogItemInterface>();
}
