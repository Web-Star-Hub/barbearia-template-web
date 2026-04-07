import { PlanRepository } from '../ports/plan-repository';

export class PlansApplicationService {
    constructor(private readonly planRepository: PlanRepository) {}

    public async listAvailablePlans() {
        return this.planRepository.listActivePlans();
    }
}
