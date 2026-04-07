import { Request, Response } from 'express';
import { PlansApplicationService } from '../../../application/services/plans-application-service';
import {
    sendErrorResponse,
    sendSuccessResponse,
} from '../shared/http-response-factory';

export class PlansHttpController {
    constructor(
        private readonly plansApplicationService: PlansApplicationService
    ) {}

    public listPlans = async (_request: Request, response: Response) => {
        try {
            const availablePlans =
                await this.plansApplicationService.listAvailablePlans();

            return sendSuccessResponse(response, availablePlans);
        } catch (error) {
            return sendErrorResponse(
                response,
                'PLANS_LIST_ERROR',
                error instanceof Error ? error.message : 'Erro inesperado.',
                'Nao foi possivel listar os planos.'
            );
        }
    };
}
