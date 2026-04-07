import { Request, Response } from 'express';
import { BarbershopPanelApplicationService } from '../../../application/services/barbershop-panel-application-service';
import {
    JwtAuthenticatedRequest,
    jwtAuthenticationMiddleware,
} from '../middleware/jwt-authentication-middleware';
import { sendErrorResponse, sendSuccessResponse } from '../shared/http-response-factory';

export class BarbershopPanelHttpController {
    constructor(
        private readonly barbershopPanelApplicationService: BarbershopPanelApplicationService
    ) {}

    public readonly requireAuthentication = jwtAuthenticationMiddleware;

    public getDashboardSummary = async (request: Request, response: Response) => {
        try {
            const jwtContext = (request as JwtAuthenticatedRequest).jwtBarbershopContext;
            const summary =
                await this.barbershopPanelApplicationService.getDashboardSummary(
                    jwtContext.barbershopIdentifier
                );

            return sendSuccessResponse(response, summary);
        } catch (error) {
            return sendErrorResponse(
                response,
                'BARBERSHOP_PANEL_DASHBOARD_ERROR',
                error instanceof Error ? error.message : 'Erro inesperado.',
                'Nao foi possivel carregar o painel.'
            );
        }
    };

    public getSubscriptionSummary = async (_request: Request, response: Response) => {
        try {
            const summary =
                await this.barbershopPanelApplicationService.getSubscriptionSummary();

            return sendSuccessResponse(response, summary);
        } catch (error) {
            return sendErrorResponse(
                response,
                'BARBERSHOP_PANEL_SUBSCRIPTION_ERROR',
                error instanceof Error ? error.message : 'Erro inesperado.',
                'Nao foi possivel carregar a assinatura.'
            );
        }
    };

    public getBarbershopTenantProfile = async (request: Request, response: Response) => {
        try {
            const jwtContext = (request as JwtAuthenticatedRequest).jwtBarbershopContext;
            const tenantProfile =
                await this.barbershopPanelApplicationService.getBarbershopTenantProfile(
                    jwtContext.barbershopIdentifier
                );

            return sendSuccessResponse(response, tenantProfile);
        } catch (error) {
            return sendErrorResponse(
                response,
                'BARBERSHOP_PANEL_TENANT_ERROR',
                error instanceof Error ? error.message : 'Erro inesperado.',
                'Nao foi possivel carregar os dados da barbearia.'
            );
        }
    };

    public listServiceOfferings = async (request: Request, response: Response) => {
        try {
            const jwtContext = (request as JwtAuthenticatedRequest).jwtBarbershopContext;
            const items =
                await this.barbershopPanelApplicationService.listServiceOfferings(
                    jwtContext.barbershopIdentifier
                );

            return sendSuccessResponse(response, items);
        } catch (error) {
            return sendErrorResponse(
                response,
                'BARBERSHOP_PANEL_SERVICES_LIST_ERROR',
                error instanceof Error ? error.message : 'Erro inesperado.',
                'Nao foi possivel listar os servicos.'
            );
        }
    };

    public createServiceOffering = async (request: Request, response: Response) => {
        try {
            const jwtContext = (request as JwtAuthenticatedRequest).jwtBarbershopContext;
            const body = request.body as {
                serviceName: string;
                priceInCents: number;
                averageDurationInMinutes: number;
            };

            const created =
                await this.barbershopPanelApplicationService.createServiceOffering(
                    jwtContext.barbershopIdentifier,
                    {
                        serviceName: body.serviceName,
                        priceInCents: body.priceInCents,
                        averageDurationInMinutes: body.averageDurationInMinutes,
                    }
                );

            return sendSuccessResponse(response, created, 201);
        } catch (error) {
            return sendErrorResponse(
                response,
                'BARBERSHOP_PANEL_SERVICE_CREATE_ERROR',
                error instanceof Error ? error.message : 'Erro inesperado.',
                'Nao foi possivel criar o servico.'
            );
        }
    };

    public deleteServiceOffering = async (request: Request, response: Response) => {
        try {
            const jwtContext = (request as JwtAuthenticatedRequest).jwtBarbershopContext;
            const serviceOfferingId = request.params.serviceOfferingId as string;

            const result =
                await this.barbershopPanelApplicationService.deleteServiceOffering(
                    jwtContext.barbershopIdentifier,
                    serviceOfferingId
                );

            return sendSuccessResponse(response, result);
        } catch (error) {
            return sendErrorResponse(
                response,
                'BARBERSHOP_PANEL_SERVICE_DELETE_ERROR',
                error instanceof Error ? error.message : 'Erro inesperado.',
                'Nao foi possivel remover o servico.'
            );
        }
    };

    public listProfessionals = async (request: Request, response: Response) => {
        try {
            const jwtContext = (request as JwtAuthenticatedRequest).jwtBarbershopContext;
            const items =
                await this.barbershopPanelApplicationService.listProfessionals(
                    jwtContext.barbershopIdentifier
                );

            return sendSuccessResponse(response, items);
        } catch (error) {
            return sendErrorResponse(
                response,
                'BARBERSHOP_PANEL_PROFESSIONALS_LIST_ERROR',
                error instanceof Error ? error.message : 'Erro inesperado.',
                'Nao foi possivel listar os profissionais.'
            );
        }
    };

    public updateBarbershopTenantProfile = async (request: Request, response: Response) => {
        try {
            const jwtContext = (request as JwtAuthenticatedRequest).jwtBarbershopContext;
            const body = request.body as Partial<{
                tradingName: string;
                profileImageUrl: string;
                whatsappContact: string;
                emailContact: string;
                taxIdentificationNumber: string;
                formattedAddress: string;
                latitude: number;
                longitude: number;
                openingHoursByWeekday: Record<
                    string,
                    { opensAt: string; closesAt: string }[]
                >;
                opensOnPublicHolidays: boolean;
                timezoneIdentifier: string;
            }>;

            const updated =
                await this.barbershopPanelApplicationService.updateBarbershopTenantProfile(
                    jwtContext.barbershopIdentifier,
                    body
                );

            return sendSuccessResponse(response, updated);
        } catch (error) {
            return sendErrorResponse(
                response,
                'BARBERSHOP_PANEL_TENANT_UPDATE_ERROR',
                error instanceof Error ? error.message : 'Erro inesperado.',
                'Nao foi possivel atualizar os dados da barbearia.'
            );
        }
    };

    public notImplementedProfessionalMutation = async (
        _request: Request,
        response: Response
    ) => {
        return sendErrorResponse(
            response,
            'BARBERSHOP_PANEL_NOT_IMPLEMENTED',
            'Operacao ainda nao implementada no servidor.',
            'Esta acao ainda nao esta disponivel na API. Use o cadastro inicial para novos profissionais.',
            501
        );
    };
}
