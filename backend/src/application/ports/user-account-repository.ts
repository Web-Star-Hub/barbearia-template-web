import { UserAccountEntity } from '../../domain/entities/user-account';

export interface UserAccountRepository {
    createUserAccount(input: Omit<UserAccountEntity, 'identifier'>): Promise<UserAccountEntity>;
    findByEmail(email: string): Promise<UserAccountEntity | null>;
}
