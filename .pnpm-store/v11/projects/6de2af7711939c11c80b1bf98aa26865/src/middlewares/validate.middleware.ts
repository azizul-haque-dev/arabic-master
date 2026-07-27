// Generic request validator built on top of Zod schemas. Each route
// module defines its own schema for body/params/query and passes it
// here, keeping validation declarative and out of the controllers.
import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { ApiError } from "../utils/api-error.js";

interface ValidationSchemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);

      if (!result.success) {
        // result.error.issues contains the array of errors
        const firstErrorMessage =
          result.error.issues[0]?.message || "Validation failed";
        throw ApiError.badRequest(firstErrorMessage, result.error.flatten());
      }
      req.body = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        const firstErrorMessage =
          result.error.issues[0]?.message || "Validation failed";
        throw ApiError.badRequest(firstErrorMessage, result.error.flatten());
      }
      req.params = result.data as typeof req.params;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        const firstErrorMessage =
          result.error.issues[0]?.message || "Validation failed";
        throw ApiError.badRequest(firstErrorMessage, result.error.flatten());
      }
      // req.query is read-only in Express 5, so store parsed values separately
      (req as Request & { validatedQuery?: unknown }).validatedQuery =
        result.data;
    }

    next();
  };
}
