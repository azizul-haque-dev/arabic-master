// Small helper to keep every success response in the same shape:
// { success, message, data, meta }. Consistency here makes the
// frontend's response handling trivial.
import { Response } from "express";

interface Meta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export function sendSuccess(
  res: Response,
  statusCode: number,
  message: string,
  data: unknown = null,
  meta?: Meta
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}
