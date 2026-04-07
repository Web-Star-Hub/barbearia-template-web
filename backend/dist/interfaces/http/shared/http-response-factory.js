"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccessResponse = sendSuccessResponse;
exports.sendErrorResponse = sendErrorResponse;
function sendSuccessResponse(response, data, statusCode = 200) {
    return response.status(statusCode).json({
        success: true,
        data,
    });
}
function sendErrorResponse(response, errorCode, errorMessage, userFriendlyMessage, statusCode = 500) {
    return response.status(statusCode).json({
        success: false,
        errorCode,
        errorMessage,
        userFriendlyMessage,
    });
}
