"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarbershopPanelApplicationService = void 0;
const mongoose_1 = require("mongoose");
const barbershop_model_1 = require("../../infrastructure/database/models/barbershop-model");
const plan_model_1 = require("../../infrastructure/database/models/plan-model");
const service_offering_model_1 = require("../../infrastructure/database/models/service-offering-model");
const user_account_model_1 = require("../../infrastructure/database/models/user-account-model");
class BarbershopPanelApplicationService {
    async getDashboardSummary(barbershopIdentifier) {
        if (!mongoose_1.Types.ObjectId.isValid(barbershopIdentifier)) {
            throw new Error('Identificador da barbearia invalido.');
        }
        const barbershopDocument = await barbershop_model_1.BarbershopModel.findById(barbershopIdentifier).lean();
        if (!barbershopDocument) {
            throw new Error('Barbearia nao encontrada.');
        }
        const serviceOfferingCount = await service_offering_model_1.ServiceOfferingModel.countDocuments({
            barbershopIdentifier,
        });
        const professionalCount = await user_account_model_1.UserAccountModel.countDocuments({
            barbershopIdentifier,
        });
        return {
            tradingName: barbershopDocument.barbershopName,
            subscriptionLifecycleStatus: 'active',
            trialEndsAt: undefined,
            serviceOfferingCount,
            professionalCount,
        };
    }
    async getSubscriptionSummary() {
        const firstPlanDocument = await plan_model_1.PlanModel.findOne({ isActive: true }).sort({
            monthlyPriceInCents: 1,
        });
        const planDisplayName = firstPlanDocument?.displayName ?? 'Plano ativo';
        const monthlyPriceInCents = firstPlanDocument?.monthlyPriceInCents ?? 0;
        const yearlyPriceInCents = monthlyPriceInCents * 12;
        return {
            subscriptionLifecycleStatus: 'active',
            trialEndsAt: undefined,
            planDisplayName,
            monthlyPriceInCents,
            yearlyPriceInCents,
            invoiceHistoryItems: [],
        };
    }
    async getBarbershopTenantProfile(barbershopIdentifier) {
        if (!mongoose_1.Types.ObjectId.isValid(barbershopIdentifier)) {
            throw new Error('Identificador da barbearia invalido.');
        }
        const barbershopDocument = await barbershop_model_1.BarbershopModel.findById(barbershopIdentifier).lean();
        if (!barbershopDocument) {
            throw new Error('Barbearia nao encontrada.');
        }
        const coordinates = barbershopDocument.location?.coordinates ?? [0, 0];
        const formattedAddressFromDocument = barbershopDocument.formattedAddress &&
            barbershopDocument.formattedAddress.trim().length > 0
            ? barbershopDocument.formattedAddress
            : `${barbershopDocument.cityName}, ${barbershopDocument.stateCode}`;
        const openingHoursFromDocument = barbershopDocument.openingHoursByWeekday &&
            typeof barbershopDocument.openingHoursByWeekday === 'object'
            ? barbershopDocument.openingHoursByWeekday
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
            trialEndsAt: undefined,
        };
    }
    async listServiceOfferings(barbershopIdentifier) {
        const serviceOfferingDocuments = await service_offering_model_1.ServiceOfferingModel.find({
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
    async createServiceOffering(barbershopIdentifier, payload) {
        const created = await service_offering_model_1.ServiceOfferingModel.create({
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
    async deleteServiceOffering(barbershopIdentifier, serviceOfferingId) {
        const deleteResult = await service_offering_model_1.ServiceOfferingModel.deleteOne({
            _id: serviceOfferingId,
            barbershopIdentifier,
        });
        return { deleted: deleteResult.deletedCount === 1 };
    }
    async listProfessionals(barbershopIdentifier) {
        const userDocuments = await user_account_model_1.UserAccountModel.find({ barbershopIdentifier }).lean();
        return userDocuments.map((userDocument) => ({
            professionalId: String(userDocument._id),
            fullName: userDocument.fullName,
            profileImageUrl: '',
            phoneNumberNormalized: '',
            emailAddressNormalized: userDocument.email,
            barbershopServiceOfferingIds: [],
            isBarbershopAdministrator: userDocument.role === 'owner',
        }));
    }
    async updateBarbershopTenantProfile(barbershopIdentifier, payload) {
        const updatePayload = {};
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
        await barbershop_model_1.BarbershopModel.updateOne({ _id: new mongoose_1.Types.ObjectId(barbershopIdentifier) }, { $set: updatePayload });
        return this.getBarbershopTenantProfile(barbershopIdentifier);
    }
}
exports.BarbershopPanelApplicationService = BarbershopPanelApplicationService;
