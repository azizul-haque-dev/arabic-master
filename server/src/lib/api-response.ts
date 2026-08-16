/**
 * API Response Helpers
 * Consistent JSON envelope format for all API responses
 */

import { Response } from "express";

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

/**
 * Send a successful API response with consistent envelope
 * @param res Express response object
 * @param statusCode HTTP status code (200, 201, etc.)
 * @param message Response message
 * @param data Response data (optional)
 */
export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
  });
}

/**
 * Send an error API response with consistent envelope
 * @param res Express response object
 * @param statusCode HTTP status code
 * @param message Error message
 */
export function sendError(res: Response, statusCode: number, message: string) {
  return res.status(statusCode).json({ success: false, message });
}
