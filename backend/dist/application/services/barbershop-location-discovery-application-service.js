"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarbershopLocationDiscoveryApplicationService = void 0;
class BarbershopLocationDiscoveryApplicationService {
    barbershopRepository;
    constructor(barbershopRepository) {
        this.barbershopRepository = barbershopRepository;
    }
    async discoverByLocation(input) {
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
exports.BarbershopLocationDiscoveryApplicationService = BarbershopLocationDiscoveryApplicationService;
