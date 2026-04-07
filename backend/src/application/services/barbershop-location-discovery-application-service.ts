import { BarbershopRepository } from '../ports/barbershop-repository';

type DiscoverBarbershopsByLocationInput = {
    latitude: number;
    longitude: number;
    radiusInKilometers: number;
};

export class BarbershopLocationDiscoveryApplicationService {
    constructor(private readonly barbershopRepository: BarbershopRepository) {}

    public async discoverByLocation(input: DiscoverBarbershopsByLocationInput) {
        const barbershops = await this.barbershopRepository.searchByLocation(input);

        return {
            searchCenter: {
                latitude: input.latitude,
                longitude: input.longitude,
            },
            radiusInKilometers: input.radiusInKilometers,
            barbershops,
        };
    }
}
