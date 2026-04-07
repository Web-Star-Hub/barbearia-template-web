import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { BarbershopSaasPublicHttpService } from '../services/barbershop-saas-public-http.service';
import { SubscriptionPlanDefinitionInterface } from '../../../core/models/barbershop-saas.models';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';

@Component({
    selector: 'app-landing-page',
    imports: [RouterLink, Button, Card, CurrencyBrlPipe],
    templateUrl: './landing-page.component.html',
    styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements OnInit {
    private readonly barbershopSaasPublicHttpService = inject(
        BarbershopSaasPublicHttpService
    );

    protected readonly subscriptionPlansSignal = signal<
        SubscriptionPlanDefinitionInterface[]
    >([]);
    protected readonly loadErrorSignal = signal<string | null>(null);
    protected readonly plansRequestFinishedSignal = signal(false);

    public ngOnInit(): void {
        this.barbershopSaasPublicHttpService.listSubscriptionPlanDefinitions().subscribe({
            next: (plans) => {
                this.subscriptionPlansSignal.set(plans);
                this.plansRequestFinishedSignal.set(true);
            },
            error: () => {
                this.loadErrorSignal.set(
                    'Nao foi possivel carregar os planos da API. Verifique se o servidor esta no ar.'
                );
                this.plansRequestFinishedSignal.set(true);
            },
        });
    }

    protected buildSubscriptionWizardRoute(planId: string): string {
        return `/cadastro?subscriptionPlanDefinitionId=${planId}`;
    }

    protected buildCadastroRouteWithoutPlan(): string {
        return '/cadastro';
    }

    protected isRecommendedPlan(plan: SubscriptionPlanDefinitionInterface): boolean {
        return plan.id === 'professional';
    }
}
