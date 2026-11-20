import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';
import { isProd } from '../../config/env.js';
import type { Logger } from '../http/logger.js';

export const notFound: RequestHandler = (req, res) => {
  const path = req.originalUrl.split('?')[0];
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Cannot ${req.method} ${path}`,
    timestamp: new Date().toISOString(),
    path,
    requestId: String(req.id),
  });
};

export const createErrorHandler =
  (logger: Logger): ErrorRequestHandler =>
  (err, req, res, _next) => {
    let statusCode = 500;
    let message: string | string[] = 'Internal server error';
    const path = req.originalUrl.split('?')[0];

    if (err instanceof AppError) {
      statusCode = err.statusCode;
      message = err.details;
    } else if (err?.expose === true && typeof err.status === 'number') {
      // body-parser: malformed JSON, payload too large
      statusCode = err.status;
      message = err.message;
    } else if (err instanceof Error && !isProd) {
      message = err.message;
    }

    logger[statusCode >= 500 ? 'error' : 'warn'](
      { err, requestId: req.id },
      `${req.method} ${path} -> ${statusCode}`,
    );

    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path,
      requestId: String(req.id),
    });
  };
