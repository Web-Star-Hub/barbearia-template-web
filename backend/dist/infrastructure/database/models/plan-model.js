"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanModel = void 0;
const mongoose_1 = require("mongoose");
const planSchema = new mongoose_1.Schema({
    identifier: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    monthlyPriceInCents: { type: Number, required: true },
    includedFeatures: { type: [String], required: true },
    isActive: { type: Boolean, required: true, default: true },
}, {
    timestamps: true,
    versionKey: false,
});
exports.PlanModel = (0, mongoose_1.model)('Plan', planSchema);
