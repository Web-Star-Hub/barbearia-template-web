"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoosePlanRepository = void 0;
const plan_model_1 = require("../models/plan-model");
class MongoosePlanRepository {
    async listActivePlans() {
        const planDocuments = await plan_model_1.PlanModel.find({ isActive: true }).lean();
        return planDocuments.map((planDocument) => ({
            identifier: planDocument.identifier,
            displayName: planDocument.displayName,
            monthlyPriceInCents: planDocument.monthlyPriceInCents,
            includedFeatures: planDocument.includedFeatures,
            isActive: planDocument.isActive,
        }));
    }
    async countPlans() {
        return plan_model_1.PlanModel.countDocuments();
    }
    async createManyPlans(plans) {
        await plan_model_1.PlanModel.insertMany(plans, { ordered: true });
    }
}
exports.MongoosePlanRepository = MongoosePlanRepository;
