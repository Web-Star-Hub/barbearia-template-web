import { model, Schema } from 'mongoose';

const userAccountSchema = new Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        passwordHash: { type: String, required: true },
        role: { type: String, required: true },
        barbershopIdentifier: { type: String, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const UserAccountModel = model('UserAccount', userAccountSchema);
