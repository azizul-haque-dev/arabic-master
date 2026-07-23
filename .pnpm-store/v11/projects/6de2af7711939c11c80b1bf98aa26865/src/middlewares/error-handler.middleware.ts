// Last middleware in the chain. Turns any thrown error into a consistent
// JSON response and makes sure unexpected (non-operational) errors are
// logged with full detail but never leak internals to the client.
import { NextFunction, Request, Response } from "express";

import { Prisma } from "@/generated/prisma/client.js";
import { isProd } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ApiError } from "../utils/api-error.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  let statusCode = 500;
  let message = "Internal server error";
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Translate common Prisma error codes into friendly HTTP responses
    if (err.code === "P2002") {
      statusCode = 409;
      message = `A record with this ${(err.meta?.target as string[])?.join(", ") ?? "value"} already exists`;
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
    } else {
      statusCode = 400;
      message = "Database request failed";
    }
  } else if (err instanceof Error) {
    message = isProd ? message : err.message;
  }

  if (statusCode >= 500) {
    logger.error(
      { err, path: req.path, method: req.method },
      "Unhandled error",
    );
  } else {
    logger.warn(
      { path: req.path, method: req.method, message },
      "Request error",
    );
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(!isProd && err instanceof Error ? { stack: err.stack } : {}),
  });
}
