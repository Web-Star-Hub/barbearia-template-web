import { PlanEntity } from '../../domain/entities/plan';

export interface PlanRepository {
    listActivePlans(): Promise<PlanEntity[]>;
    countPlans(): Promise<number>;
    createManyPlans(plans: PlanEntity[]): Promise<void>;
}
