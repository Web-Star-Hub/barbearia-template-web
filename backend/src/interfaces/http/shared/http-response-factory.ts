import { Response } from 'express';

export function sendSuccessResponse<TData>(
    response: Response,
    data: TData,
    statusCode = 200
) {
    return response.status(statusCode).json({
        success: true,
        data,
    });
}

export function sendErrorResponse(
    response: Response,
    errorCode: string,
    errorMessage: string,
    userFriendlyMessage: string,
    statusCode = 500
) {
    return response.status(statusCode).json({
        success: false,
        errorCode,
        errorMessage,
        userFriendlyMessage,
    });
}
