export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly details: string | string[],
  ) {
    super(Array.isArray(details) ? details.join('; ') : details);
  }
}
export class BadRequestError extends AppError {
  constructor(m: string | string[]) {
    super(400, m);
  }
}
export class UnauthorizedError extends AppError {
  constructor(m: string | string[]) {
    super(401, m);
  }
}
export class ForbiddenError extends AppError {
  constructor(m: string | string[]) {
    super(403, m);
  }
}
export class NotFoundError extends AppError {
  constructor(m: string | string[]) {
    super(404, m);
  }
}
export class ConflictError extends AppError {
  constructor(m: string | string[]) {
    super(409, m);
  }
}
export class PayloadTooLargeError extends AppError {
  constructor(m: string | string[]) {
    super(413, m);
  }
}
export class UnsupportedMediaTypeError extends AppError {
  constructor(m: string | string[]) {
    super(415, m);
  }
}
export class ServiceUnavailableError extends AppError {
  constructor(m: string | string[]) {
    super(503, m);
  }
}
