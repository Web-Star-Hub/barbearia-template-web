import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgxFadeComponent } from '@omnedia/ngx-fade';
import { NgxShineBorderComponent } from '@omnedia/ngx-shine-border';
import { ServiceCatalogApiService } from '../services/service-catalog-api.service';
import {
    BusinessLocationInterface,
    ServiceCatalogItemInterface,
} from '../../../core/models/domain.models';
import { ServiceCardComponent } from '../components/service-card.component';
import { SchedulingSelectionService } from '../../scheduling/services/scheduling-selection.service';

@Component({
    selector: 'app-service-catalog-page',
    standalone: true,
    imports: [CommonModule, NgxFadeComponent, NgxShineBorderComponent, ServiceCardComponent],
    template: `
        <section class="page-shell">
            <om-fade direction="up">
                <om-shine-border>
                    <div class="title-block">
                        <h2>Escolha seu servico</h2>
                        <p class="subtitle">
                            Selecione uma opcao para continuar com o agendamento
                        </p>
                    </div>
                </om-shine-border>
            </om-fade>
            <div class="service-list">
                <om-fade
                    direction="up"
                    *ngFor="let serviceCatalogItem of serviceCatalogItems()"
                >
                    <app-service-card
                        [serviceCatalogItem]="serviceCatalogItem"
                        (selectService)="onServiceSelected($event)"
                    />
                </om-fade>
            </div>

            <om-fade direction="up" *ngIf="businessLocation() as currentBusinessLocation">
                <om-shine-border>
                    <section class="location-block">
                        <h3>Endereco da barbearia</h3>
                        <p>{{ currentBusinessLocation.fullAddress }}</p>
                        <iframe
                            class="location-map-frame"
                            [src]="businessLocationMapEmbedUrl()"
                            loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade"
                            title="Mapa da barbearia"
                        ></iframe>
                        <a
                            class="location-map-link"
                            [href]="businessLocationMapSearchUrl()"
                            target="_blank"
                        >
                            Abrir no Google Maps
                        </a>
                    </section>
                </om-shine-border>
            </om-fade>
        </section>
    `,
    styles: `
        .page-shell {
            display: grid;
            gap: 16px;
            width: 100%;
            max-width: 560px;
            margin: 0 auto;
            min-height: calc(100vh - 220px);
            align-content: center;
        }

        h2 {
            margin: 0;
            font-size: 1.35rem;
        }

        .subtitle {
            margin: 0;
            color: var(--color-text-secondary);
        }

        .title-block {
            display: grid;
            gap: 8px;
            padding: 14px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.03);
        }

        .service-list {
            display: grid;
            gap: 12px;
            width: 100%;
        }

        .location-block {
            display: grid;
            gap: 10px;
            padding: 14px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.03);
        }

        .location-block h3,
        .location-block p {
            margin: 0;
        }

        .location-map-frame {
            width: 100%;
            min-height: 230px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.02);
        }

        .location-map-link {
            text-decoration: none;
            color: var(--color-primary);
            font-weight: 700;
            min-height: 44px;
            display: inline-flex;
            align-items: center;
        }

        @media (max-width: 768px) {
            .page-shell {
                min-height: auto;
                align-content: start;
            }
        }
    `,
})
export class ServiceCatalogPageComponent {
    protected readonly serviceCatalogItems = signal<ServiceCatalogItemInterface[]>([]);
    protected readonly businessLocation = signal<BusinessLocationInterface | null>(null);
    protected readonly businessLocationMapEmbedUrl = signal<SafeResourceUrl | string>(
        'about:blank'
    );
    protected readonly businessLocationMapSearchUrl = signal('');

    constructor(
        private readonly serviceCatalogApiService: ServiceCatalogApiService,
        private readonly schedulingSelectionService: SchedulingSelectionService,
        private readonly router: Router,
        private readonly domSanitizer: DomSanitizer
    ) {
        this.serviceCatalogApiService
            .listServices()
            .subscribe((serviceCatalogItems) =>
                this.serviceCatalogItems.set(serviceCatalogItems)
            );

        this.serviceCatalogApiService.getBusinessLocation().subscribe((businessLocation) => {
            this.businessLocation.set(businessLocation);
            if (!businessLocation) {
                this.businessLocationMapEmbedUrl.set('about:blank');
                this.businessLocationMapSearchUrl.set('');
                return;
            }

            const encodedMapQuery = encodeURIComponent(businessLocation.mapQuery);
            const mapEmbedUrl = `https://www.google.com/maps?q=${encodedMapQuery}&output=embed`;
            const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedMapQuery}`;
            this.businessLocationMapEmbedUrl.set(
                this.domSanitizer.bypassSecurityTrustResourceUrl(mapEmbedUrl)
            );
            this.businessLocationMapSearchUrl.set(mapSearchUrl);
        });
    }

    protected onServiceSelected(serviceCatalogItem: ServiceCatalogItemInterface): void {
        this.schedulingSelectionService.setSelectedService(serviceCatalogItem);
        this.router.navigateByUrl('/agendamento');
    }
}
