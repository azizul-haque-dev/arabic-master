import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void {
        const incomingId = req.headers[REQUEST_ID_HEADER];

        const requestId =
            typeof incomingId === 'string' && incomingId.length > 0
                ? incomingId
                : randomUUID();

        req.headers[REQUEST_ID_HEADER] = requestId;
        res.setHeader('X-Request-Id', requestId);

        next();
    }
}