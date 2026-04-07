"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseBarbershopRepository = void 0;
const barbershop_model_1 = require("../models/barbershop-model");
function parseRegistrationStatus(registrationStatusValue) {
    if (registrationStatusValue === 'active') {
        return 'active';
    }
    return 'pending_activation';
}
class MongooseBarbershopRepository {
    async createBarbershop(input) {
        const createdBarbershop = await barbershop_model_1.BarbershopModel.create({
            barbershopName: input.barbershopName,
            ownerFullName: input.ownerFullName,
            ownerEmail: input.ownerEmail,
            cityName: input.cityName,
            stateCode: input.stateCode,
            registrationStatus: input.registrationStatus,
            profileImageUrl: input.profileImageUrl ?? '',
            whatsappContact: input.whatsappContact ?? '',
            emailContact: input.emailContact ?? '',
            taxIdentificationNumber: input.taxIdentificationNumber ?? '',
            formattedAddress: input.formattedAddress ?? '',
            opensOnPublicHolidays: input.opensOnPublicHolidays ?? false,
            timezoneIdentifier: input.timezoneIdentifier ?? 'America/Sao_Paulo',
            openingHoursByWeekday: input.openingHoursByWeekday ?? {},
            location: {
                type: 'Point',
                coordinates: [input.location.longitude, input.location.latitude],
            },
        });
        const createdBarbershopLocationCoordinates = createdBarbershop.location?.coordinates ?? [0, 0];
        return {
            identifier: String(createdBarbershop._id),
            barbershopName: createdBarbershop.barbershopName,
            ownerFullName: createdBarbershop.ownerFullName,
            ownerEmail: createdBarbershop.ownerEmail,
            cityName: createdBarbershop.cityName,
            stateCode: createdBarbershop.stateCode,
            registrationStatus: parseRegistrationStatus(createdBarbershop.registrationStatus),
            location: {
                latitude: createdBarbershopLocationCoordinates[1],
                longitude: createdBarbershopLocationCoordinates[0],
            },
            whatsappContact: typeof createdBarbershop.whatsappContact === 'string'
                ? createdBarbershop.whatsappContact
                : undefined,
        };
    }
    async searchByLocation(params) {
        const searchRadiusInMeters = params.radiusInKilometers * 1000;
        const barbershopDocuments = await barbershop_model_1.BarbershopModel.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [params.longitude, params.latitude],
                    },
                    $maxDistance: searchRadiusInMeters,
                },
            },
        }).lean();
        return barbershopDocuments.map((barbershopDocument) => {
            const barbershopLocationCoordinates = barbershopDocument.location?.coordinates ?? [0, 0];
            return {
                identifier: String(barbershopDocument._id),
                barbershopName: barbershopDocument.barbershopName,
                ownerFullName: barbershopDocument.ownerFullName,
                ownerEmail: barbershopDocument.ownerEmail,
                cityName: barbershopDocument.cityName,
                stateCode: barbershopDocument.stateCode,
                registrationStatus: parseRegistrationStatus(barbershopDocument.registrationStatus),
                location: {
                    latitude: barbershopLocationCoordinates[1],
                    longitude: barbershopLocationCoordinates[0],
                },
                whatsappContact: typeof barbershopDocument.whatsappContact === 'string'
                    ? barbershopDocument.whatsappContact
                    : undefined,
            };
        });
    }
}
exports.MongooseBarbershopRepository = MongooseBarbershopRepository;
