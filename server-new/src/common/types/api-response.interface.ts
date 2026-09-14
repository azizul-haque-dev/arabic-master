export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
    message: string;
}

export interface ErrorResponse {
    success: false;
    statusCode: number;
    message: string | string[];
    timestamp: string;
    path: string;
    requestId: string;
}