// Successful API responses always use one envelope. `data` is omitted when
// an action has no payload.
import { Response } from "express";

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

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

export function sendError(res: Response, statusCode: number, message: string) {
  return res.status(statusCode).json({ success: false, message });
}
