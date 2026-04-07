import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { environmentConfiguration } from '../../infrastructure/config/environment-configuration';
import { UserAccountRepository } from '../ports/user-account-repository';

type LoginInput = {
    email: string;
    password: string;
};

export class AuthenticationApplicationService {
    constructor(private readonly userAccountRepository: UserAccountRepository) {}

    public async login(input: LoginInput) {
        const userAccount = await this.userAccountRepository.findByEmail(input.email);

        if (!userAccount) {
            throw new Error('Credenciais inválidas.');
        }

        const isPasswordValid = await bcrypt.compare(
            input.password,
            userAccount.passwordHash
        );

        if (!isPasswordValid) {
            throw new Error('Credenciais inválidas.');
        }

        const accessToken = jwt.sign(
            {
                userAccountIdentifier: userAccount.identifier,
                role: userAccount.role,
                barbershopIdentifier: userAccount.barbershopIdentifier,
            },
            environmentConfiguration.jwtSecret,
            {
                expiresIn:
                    environmentConfiguration.jwtExpirationTime as jwt.SignOptions['expiresIn'],
            }
        );

        return {
            accessToken,
            tokenType: 'Bearer',
            expiresIn: environmentConfiguration.jwtExpirationTime,
            authenticatedUser: {
                userAccountIdentifier: userAccount.identifier,
                email: userAccount.email,
                fullName: userAccount.fullName,
                barbershopIdentifier: userAccount.barbershopIdentifier,
                role: userAccount.role,
            },
        };
    }
}
