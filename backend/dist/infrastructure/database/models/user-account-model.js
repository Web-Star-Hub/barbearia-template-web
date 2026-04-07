"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAccountModel = void 0;
const mongoose_1 = require("mongoose");
const userAccountSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true },
    barbershopIdentifier: { type: String, required: true },
}, {
    timestamps: true,
    versionKey: false,
});
exports.UserAccountModel = (0, mongoose_1.model)('UserAccount', userAccountSchema);
