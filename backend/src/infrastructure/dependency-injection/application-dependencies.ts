import { AuthenticationApplicationService } from '../../application/services/authentication-application-service';
import { BarbershopLocationDiscoveryApplicationService } from '../../application/services/barbershop-location-discovery-application-service';
import { BarbershopPanelApplicationService } from '../../application/services/barbershop-panel-application-service';
import { BarbershopRegistrationApplicationService } from '../../application/services/barbershop-registration-application-service';
import { DefaultPlansSeedingApplicationService } from '../../application/services/default-plans-seeding-application-service';
import { PlansApplicationService } from '../../application/services/plans-application-service';
import { MongooseBarbershopRepository } from '../database/repositories/mongoose-barbershop-repository';
import { MongoosePlanRepository } from '../database/repositories/mongoose-plan-repository';
import { MongooseUserAccountRepository } from '../database/repositories/mongoose-user-account-repository';

export function createApplicationDependencies() {
    const planRepository = new MongoosePlanRepository();
    const barbershopRepository = new MongooseBarbershopRepository();
    const userAccountRepository = new MongooseUserAccountRepository();

    const plansApplicationService = new PlansApplicationService(planRepository);
    const barbershopRegistrationApplicationService =
        new BarbershopRegistrationApplicationService(
            barbershopRepository,
            userAccountRepository
        );
    const authenticationApplicationService = new AuthenticationApplicationService(
        userAccountRepository
    );
    const barbershopLocationDiscoveryApplicationService =
        new BarbershopLocationDiscoveryApplicationService(barbershopRepository);
    const defaultPlansSeedingApplicationService =
        new DefaultPlansSeedingApplicationService(planRepository);
    const barbershopPanelApplicationService = new BarbershopPanelApplicationService();

    return {
        plansApplicationService,
        barbershopRegistrationApplicationService,
        authenticationApplicationService,
        barbershopLocationDiscoveryApplicationService,
        defaultPlansSeedingApplicationService,
        barbershopPanelApplicationService,
    };
}

export type ApplicationDependencies = ReturnType<
    typeof createApplicationDependencies
>;
