import { model, Schema } from 'mongoose';

const barbershopSchema = new Schema(
    {
        barbershopName: { type: String, required: true },
        ownerFullName: { type: String, required: true },
        ownerEmail: { type: String, required: true, lowercase: true },
        cityName: { type: String, required: true },
        stateCode: { type: String, required: true },
        registrationStatus: { type: String, required: true },
        profileImageUrl: { type: String, default: '' },
        whatsappContact: { type: String, default: '' },
        emailContact: { type: String, default: '' },
        taxIdentificationNumber: { type: String, default: '' },
        formattedAddress: { type: String, default: '' },
        opensOnPublicHolidays: { type: Boolean, default: false },
        timezoneIdentifier: { type: String, default: 'America/Sao_Paulo' },
        openingHoursByWeekday: {
            type: Schema.Types.Mixed,
            default: {},
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                required: true,
                validate: (value: number[]) => value.length === 2,
            },
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

barbershopSchema.index({ location: '2dsphere' });

export const BarbershopModel = model('Barbershop', barbershopSchema);
