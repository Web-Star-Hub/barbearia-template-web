import { UserAccountRepository } from '../../../application/ports/user-account-repository';
import { UserAccountEntity } from '../../../domain/entities/user-account';
import { UserAccountModel } from '../models/user-account-model';

function parseUserRole(userRoleValue: string): UserAccountEntity['role'] {
    if (
        userRoleValue === 'owner' ||
        userRoleValue === 'admin' ||
        userRoleValue === 'professional' ||
        userRoleValue === 'client'
    ) {
        return userRoleValue;
    }

    return 'client';
}

export class MongooseUserAccountRepository implements UserAccountRepository {
    public async createUserAccount(
        input: Omit<UserAccountEntity, 'identifier'>
    ): Promise<UserAccountEntity> {
        const createdUserAccount = await UserAccountModel.create({
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

    public async findByEmail(email: string): Promise<UserAccountEntity | null> {
        const userAccountDocument = await UserAccountModel.findOne({
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
