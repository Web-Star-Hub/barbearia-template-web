export interface ApiSuccessResponseInterface<TData> {
    success: true;
    data: TData;
}

export interface ApiErrorResponseInterface {
    success: false;
    errorCode: string;
    errorMessage: string;
    userFriendlyMessage: string;
}
