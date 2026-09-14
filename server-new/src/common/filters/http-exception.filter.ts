import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { REQUEST_ID_HEADER } from '../middleware/request-id.middleware.js';
import { ErrorResponse } from '../types/api-response.interface.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const isProduction = process.env.NODE_ENV === 'production';
        const requestId = (request.headers[REQUEST_ID_HEADER] as string) ?? 'unknown';

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (
                typeof exceptionResponse === 'object' &&
                exceptionResponse !== null &&
                'message' in exceptionResponse
            ) {
                message = (exceptionResponse as { message: string | string[] }).message;
            }
        } else if (exception instanceof Error) {
            message = isProduction ? 'Internal server error' : exception.message;
        }

        this.logger.error(
            `[${requestId}] ${request.method} ${request.url} -> ${statusCode}`,
            exception instanceof Error ? exception.stack : String(exception),
        );

        const errorBody: ErrorResponse = {
            success: false,
            statusCode,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId,
        };

        response.status(statusCode).json(errorBody);
    }
}