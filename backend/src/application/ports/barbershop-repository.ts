import { BarbershopEntity } from '../../domain/entities/barbershop';

export type RegisterBarbershopRepositoryInput = Omit<BarbershopEntity, 'identifier'>;

export interface BarbershopRepository {
    createBarbershop(input: RegisterBarbershopRepositoryInput): Promise<BarbershopEntity>;
    searchByLocation(params: {
        latitude: number;
        longitude: number;
        radiusInKilometers: number;
    }): Promise<BarbershopEntity[]>;
}
