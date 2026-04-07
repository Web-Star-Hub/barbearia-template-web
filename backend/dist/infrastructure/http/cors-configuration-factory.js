"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCorsMiddleware = createCorsMiddleware;
const cors_1 = __importDefault(require("cors"));
function createCorsMiddleware(allowedOrigins) {
    const corsOptions = {
        origin: (requestOrigin, callback) => {
            if (!requestOrigin) {
                callback(null, true);
                return;
            }
            if (allowedOrigins.includes(requestOrigin)) {
                callback(null, true);
                return;
            }
            callback(new Error('Origem não permitida pelo CORS.'));
        },
        credentials: true,
    };
    return (0, cors_1.default)(corsOptions);
}
