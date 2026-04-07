"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApplicationDependencies = createApplicationDependencies;
const authentication_application_service_1 = require("../../application/services/authentication-application-service");
const barbershop_location_discovery_application_service_1 = require("../../application/services/barbershop-location-discovery-application-service");
const barbershop_panel_application_service_1 = require("../../application/services/barbershop-panel-application-service");
const barbershop_registration_application_service_1 = require("../../application/services/barbershop-registration-application-service");
const default_plans_seeding_application_service_1 = require("../../application/services/default-plans-seeding-application-service");
const plans_application_service_1 = require("../../application/services/plans-application-service");
const mongoose_barbershop_repository_1 = require("../database/repositories/mongoose-barbershop-repository");
const mongoose_plan_repository_1 = require("../database/repositories/mongoose-plan-repository");
const mongoose_user_account_repository_1 = require("../database/repositories/mongoose-user-account-repository");
function createApplicationDependencies() {
    const planRepository = new mongoose_plan_repository_1.MongoosePlanRepository();
    const barbershopRepository = new mongoose_barbershop_repository_1.MongooseBarbershopRepository();
    const userAccountRepository = new mongoose_user_account_repository_1.MongooseUserAccountRepository();
    const plansApplicationService = new plans_application_service_1.PlansApplicationService(planRepository);
    const barbershopRegistrationApplicationService = new barbershop_registration_application_service_1.BarbershopRegistrationApplicationService(barbershopRepository, userAccountRepository);
    const authenticationApplicationService = new authentication_application_service_1.AuthenticationApplicationService(userAccountRepository);
    const barbershopLocationDiscoveryApplicationService = new barbershop_location_discovery_application_service_1.BarbershopLocationDiscoveryApplicationService(barbershopRepository);
    const defaultPlansSeedingApplicationService = new default_plans_seeding_application_service_1.DefaultPlansSeedingApplicationService(planRepository);
    const barbershopPanelApplicationService = new barbershop_panel_application_service_1.BarbershopPanelApplicationService();
    return {
        plansApplicationService,
        barbershopRegistrationApplicationService,
        authenticationApplicationService,
        barbershopLocationDiscoveryApplicationService,
        defaultPlansSeedingApplicationService,
        barbershopPanelApplicationService,
    };
}
