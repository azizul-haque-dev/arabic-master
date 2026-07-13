// Lightweight request logger built directly on pino instead of pulling
// in pino-http, keeping the dependency list minimal.
import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Math.round(durationMs),
      },
      "request completed",
    );
  });

  next();
}
