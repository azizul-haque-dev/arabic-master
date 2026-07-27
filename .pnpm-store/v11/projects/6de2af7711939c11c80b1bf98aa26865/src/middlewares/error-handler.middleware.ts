import { Prisma } from "@/generated/prisma/client.js";
import { NextFunction, Request, Response } from "express";
import z from "zod";
import { isProd } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ApiError } from "../utils/api-error.js";
import { sendError } from "../utils/api-response.js";

// Converts every thrown error into the public error envelope:
// { success: false, message: "reason" }.
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  let statusCode = 500;
  let message = "Internal server error";

  if (err instanceof z.ZodError) {
    message = err.issues.map((issue: any) => issue.message).join(", ");
    statusCode = 400;
  } else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
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
  } else if (err instanceof Error && !isProd) {
    message = err.message;
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

  return sendError(res, statusCode, message);
}
