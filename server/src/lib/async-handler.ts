/**
 * Async Handler Wrapper
 * Wraps async Express route handlers to forward rejected promises to error middleware
 */

import { NextFunction, Request, Response } from "express";

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Express middleware wrapper for async route handlers
 * Catches Promise rejections and forwards them to the error middleware
 * instead of crashing the process
 */
export const asyncHandler = (fn: AsyncFn) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
