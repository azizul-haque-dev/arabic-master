// Catches any request that didn't match a route.
import { Request, Response } from "express";
import { sendError } from "@/lib/api-response.js";

export function notFoundHandler(req: Request, res: Response) {
  return sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
}
