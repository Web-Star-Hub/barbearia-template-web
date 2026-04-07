"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultPlansSeedingApplicationService = void 0;
class DefaultPlansSeedingApplicationService {
    planRepository;
    constructor(planRepository) {
        this.planRepository = planRepository;
    }
    async seedDefaultPlansIfNeeded() {
        const plansCount = await this.planRepository.countPlans();
        if (plansCount > 0) {
            return;
        }
        await this.planRepository.createManyPlans([
            {
                identifier: 'basic',
                displayName: 'Plano Basico',
                monthlyPriceInCents: 4900,
                includedFeatures: ['Agenda online', 'Cadastro de clientes'],
                isActive: true,
            },
            {
                identifier: 'professional',
                displayName: 'Plano Profissional',
                monthlyPriceInCents: 8900,
                includedFeatures: [
                    'Agenda online',
                    'Cadastro de clientes',
                    'Relatorios de desempenho',
                ],
                isActive: true,
            },
            {
                identifier: 'growth',
                displayName: 'Plano Crescimento',
                monthlyPriceInCents: 12900,
                includedFeatures: [
                    'Agenda online',
                    'Cadastro de clientes',
                    'Relatorios de desempenho',
                    'Ate 6 profissionais',
                ],
                isActive: true,
            },
        ]);
    }
}
exports.DefaultPlansSeedingApplicationService = DefaultPlansSeedingApplicationService;
