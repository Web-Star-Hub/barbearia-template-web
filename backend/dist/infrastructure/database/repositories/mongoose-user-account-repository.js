"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseUserAccountRepository = void 0;
const user_account_model_1 = require("../models/user-account-model");
function parseUserRole(userRoleValue) {
    if (userRoleValue === 'owner' ||
        userRoleValue === 'admin' ||
        userRoleValue === 'professional' ||
        userRoleValue === 'client') {
        return userRoleValue;
    }
    return 'client';
}
class MongooseUserAccountRepository {
    async createUserAccount(input) {
        const createdUserAccount = await user_account_model_1.UserAccountModel.create({
            fullName: input.fullName,
            email: input.email.toLowerCase(),
            passwordHash: input.passwordHash,
            role: input.role,
            barbershopIdentifier: input.barbershopIdentifier,
        });
        return {
            identifier: String(createdUserAccount._id),
            fullName: createdUserAccount.fullName,
            email: createdUserAccount.email,
            passwordHash: createdUserAccount.passwordHash,
            role: parseUserRole(createdUserAccount.role),
            barbershopIdentifier: createdUserAccount.barbershopIdentifier,
        };
    }
    async findByEmail(email) {
        const userAccountDocument = await user_account_model_1.UserAccountModel.findOne({
            email: email.toLowerCase(),
        }).lean();
        if (!userAccountDocument) {
            return null;
        }
        return {
            identifier: String(userAccountDocument._id),
            fullName: userAccountDocument.fullName,
            email: userAccountDocument.email,
            passwordHash: userAccountDocument.passwordHash,
            role: parseUserRole(userAccountDocument.role),
            barbershopIdentifier: userAccountDocument.barbershopIdentifier,
        };
    }
}
exports.MongooseUserAccountRepository = MongooseUserAccountRepository;
