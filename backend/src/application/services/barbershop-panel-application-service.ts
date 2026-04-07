import { Types } from 'mongoose';
import { BarbershopModel } from '../../infrastructure/database/models/barbershop-model';
import { PlanModel } from '../../infrastructure/database/models/plan-model';
import { ServiceOfferingModel } from '../../infrastructure/database/models/service-offering-model';
import { UserAccountModel } from '../../infrastructure/database/models/user-account-model';

export class BarbershopPanelApplicationService {
    public async getDashboardSummary(barbershopIdentifier: string) {
        if (!Types.ObjectId.isValid(barbershopIdentifier)) {
            throw new Error('Identificador da barbearia invalido.');
        }

        const barbershopDocument = await BarbershopModel.findById(barbershopIdentifier).lean();

        if (!barbershopDocument) {
            throw new Error('Barbearia nao encontrada.');
        }

        const serviceOfferingCount = await ServiceOfferingModel.countDocuments({
            barbershopIdentifier,
        });

        const professionalCount = await UserAccountModel.countDocuments({
            barbershopIdentifier,
        });

        return {
            tradingName: barbershopDocument.barbershopName,
            subscriptionLifecycleStatus: 'active',
            trialEndsAt: undefined as string | undefined,
            serviceOfferingCount,
            professionalCount,
        };
    }

    public async getSubscriptionSummary() {
        const firstPlanDocument = await PlanModel.findOne({ isActive: true }).sort({
            monthlyPriceInCents: 1,
        });

        const planDisplayName = firstPlanDocument?.displayName ?? 'Plano ativo';
        const monthlyPriceInCents = firstPlanDocument?.monthlyPriceInCents ?? 0;
        const yearlyPriceInCents = monthlyPriceInCents * 12;

        return {
            subscriptionLifecycleStatus: 'active',
            trialEndsAt: undefined as string | undefined,
            planDisplayName,
            monthlyPriceInCents,
            yearlyPriceInCents,
            invoiceHistoryItems: [] as Array<{
                issuedAt: string;
                amountInCents: number;
                description: string;
            }>,
        };
    }

    public async getBarbershopTenantProfile(barbershopIdentifier: string) {
        if (!Types.ObjectId.isValid(barbershopIdentifier)) {
            throw new Error('Identificador da barbearia invalido.');
        }

        const barbershopDocument = await BarbershopModel.findById(barbershopIdentifier).lean();

        if (!barbershopDocument) {
            throw new Error('Barbearia nao encontrada.');
        }

        const coordinates = barbershopDocument.location?.coordinates ?? [0, 0];

        const formattedAddressFromDocument =
            barbershopDocument.formattedAddress &&
            barbershopDocument.formattedAddress.trim().length > 0
                ? barbershopDocument.formattedAddress
                : `${barbershopDocument.cityName}, ${barbershopDocument.stateCode}`;

        const openingHoursFromDocument =
            barbershopDocument.openingHoursByWeekday &&
            typeof barbershopDocument.openingHoursByWeekday === 'object'
                ? (barbershopDocument.openingHoursByWeekday as Record<
                      string,
                      { opensAt: string; closesAt: string }[]
                  >)
                : {};

        return {
            id: String(barbershopDocument._id),
            tradingName: barbershopDocument.barbershopName,
            profileImageUrl: barbershopDocument.profileImageUrl ?? '',
            whatsappContact: barbershopDocument.whatsappContact ?? '',
            emailContact: barbershopDocument.emailContact || undefined,
            taxIdentificationNumber: barbershopDocument.taxIdentificationNumber || undefined,
            formattedAddress: formattedAddressFromDocument,
            latitude: coordinates[1],
            longitude: coordinates[0],
            openingHoursByWeekday: openingHoursFromDocument,
            opensOnPublicHolidays: barbershopDocument.opensOnPublicHolidays ?? false,
            timezoneIdentifier: barbershopDocument.timezoneIdentifier ?? 'America/Sao_Paulo',
            subscriptionPlanDefinitionId: 'basic',
            subscriptionLifecycleStatus: 'active',
            trialEndsAt: undefined as string | undefined,
        };
    }

    public async listServiceOfferings(barbershopIdentifier: string) {
        const serviceOfferingDocuments = await ServiceOfferingModel.find({
            barbershopIdentifier,
        }).lean();

        return serviceOfferingDocuments.map((document) => ({
            id: String(document._id),
            barbershopTenantId: barbershopIdentifier,
            serviceName: document.serviceName,
            priceInCents: document.priceInCents,
            averageDurationInMinutes: document.averageDurationInMinutes,
        }));
    }

    public async createServiceOffering(
        barbershopIdentifier: string,
        payload: {
            serviceName: string;
            priceInCents: number;
            averageDurationInMinutes: number;
        }
    ) {
        const created = await ServiceOfferingModel.create({
            barbershopIdentifier,
            serviceName: payload.serviceName,
            priceInCents: payload.priceInCents,
            averageDurationInMinutes: payload.averageDurationInMinutes,
        });

        return {
            id: String(created._id),
            barbershopTenantId: barbershopIdentifier,
            serviceName: created.serviceName,
            priceInCents: created.priceInCents,
            averageDurationInMinutes: created.averageDurationInMinutes,
        };
    }

    public async deleteServiceOffering(
        barbershopIdentifier: string,
        serviceOfferingId: string
    ) {
        const deleteResult = await ServiceOfferingModel.deleteOne({
            _id: serviceOfferingId,
            barbershopIdentifier,
        });

        return { deleted: deleteResult.deletedCount === 1 };
    }

    public async listProfessionals(barbershopIdentifier: string) {
        const userDocuments = await UserAccountModel.find({ barbershopIdentifier }).lean();

        return userDocuments.map((userDocument) => ({
            professionalId: String(userDocument._id),
            fullName: userDocument.fullName,
            profileImageUrl: '',
            phoneNumberNormalized: '',
            emailAddressNormalized: userDocument.email,
            barbershopServiceOfferingIds: [] as string[],
            isBarbershopAdministrator: userDocument.role === 'owner',
        }));
    }

    public async updateBarbershopTenantProfile(
        barbershopIdentifier: string,
        payload: Partial<{
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
        }>
    ) {
        const updatePayload: Record<string, unknown> = {};

        if (payload.tradingName !== undefined) {
            updatePayload.barbershopName = payload.tradingName;
        }

        if (payload.profileImageUrl !== undefined) {
            updatePayload.profileImageUrl = payload.profileImageUrl;
        }

        if (payload.whatsappContact !== undefined) {
            updatePayload.whatsappContact = payload.whatsappContact;
        }

        if (payload.emailContact !== undefined) {
            updatePayload.emailContact = payload.emailContact;
        }

        if (payload.taxIdentificationNumber !== undefined) {
            updatePayload.taxIdentificationNumber = payload.taxIdentificationNumber;
        }

        if (payload.formattedAddress !== undefined) {
            updatePayload.formattedAddress = payload.formattedAddress;
        }

        if (payload.opensOnPublicHolidays !== undefined) {
            updatePayload.opensOnPublicHolidays = payload.opensOnPublicHolidays;
        }

        if (payload.timezoneIdentifier !== undefined) {
            updatePayload.timezoneIdentifier = payload.timezoneIdentifier;
        }

        if (payload.openingHoursByWeekday !== undefined) {
            updatePayload.openingHoursByWeekday = payload.openingHoursByWeekday;
        }

        if (payload.latitude !== undefined && payload.longitude !== undefined) {
            updatePayload.location = {
                type: 'Point',
                coordinates: [payload.longitude, payload.latitude],
            };
        }

        await BarbershopModel.updateOne(
            { _id: new Types.ObjectId(barbershopIdentifier) },
            { $set: updatePayload }
        );

        return this.getBarbershopTenantProfile(barbershopIdentifier);
    }
}
