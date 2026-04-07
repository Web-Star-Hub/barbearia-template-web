import { PlanRepository } from '../../../application/ports/plan-repository';
import { PlanEntity } from '../../../domain/entities/plan';
import { PlanModel } from '../models/plan-model';

export class MongoosePlanRepository implements PlanRepository {
    public async listActivePlans(): Promise<PlanEntity[]> {
        const planDocuments = await PlanModel.find({ isActive: true }).lean();

        return planDocuments.map((planDocument) => ({
            identifier: planDocument.identifier,
            displayName: planDocument.displayName,
            monthlyPriceInCents: planDocument.monthlyPriceInCents,
            includedFeatures: planDocument.includedFeatures,
            isActive: planDocument.isActive,
        }));
    }

    public async countPlans(): Promise<number> {
        return PlanModel.countDocuments();
    }

    public async createManyPlans(plans: PlanEntity[]): Promise<void> {
        await PlanModel.insertMany(plans, { ordered: true });
    }
}
