import { model, Schema } from 'mongoose';

const planSchema = new Schema(
    {
        identifier: { type: String, required: true, unique: true },
        displayName: { type: String, required: true },
        monthlyPriceInCents: { type: Number, required: true },
        includedFeatures: { type: [String], required: true },
        isActive: { type: Boolean, required: true, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const PlanModel = model('Plan', planSchema);
