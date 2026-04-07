import { model, Schema } from 'mongoose';

const serviceOfferingSchema = new Schema(
    {
        barbershopIdentifier: { type: String, required: true, index: true },
        serviceName: { type: String, required: true },
        priceInCents: { type: Number, required: true },
        averageDurationInMinutes: { type: Number, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const ServiceOfferingModel = model('ServiceOffering', serviceOfferingSchema);
