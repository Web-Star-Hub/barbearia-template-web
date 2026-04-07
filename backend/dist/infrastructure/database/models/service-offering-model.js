"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceOfferingModel = void 0;
const mongoose_1 = require("mongoose");
const serviceOfferingSchema = new mongoose_1.Schema({
    barbershopIdentifier: { type: String, required: true, index: true },
    serviceName: { type: String, required: true },
    priceInCents: { type: Number, required: true },
    averageDurationInMinutes: { type: Number, required: true },
}, {
    timestamps: true,
    versionKey: false,
});
exports.ServiceOfferingModel = (0, mongoose_1.model)('ServiceOffering', serviceOfferingSchema);
