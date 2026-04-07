export type UserAccountEntity = {
    identifier: string;
    fullName: string;
    email: string;
    passwordHash: string;
    role: 'owner' | 'admin' | 'professional' | 'client';
    barbershopIdentifier: string;
};
