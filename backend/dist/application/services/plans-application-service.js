"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlansApplicationService = void 0;
class PlansApplicationService {
    planRepository;
    constructor(planRepository) {
        this.planRepository = planRepository;
    }
    async listAvailablePlans() {
        return this.planRepository.listActivePlans();
    }
}
exports.PlansApplicationService = PlansApplicationService;
