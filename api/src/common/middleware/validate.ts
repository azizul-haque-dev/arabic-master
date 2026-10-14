import type { Request, RequestHandler } from 'express';
import { ZodError, type ZodType } from 'zod';
import { BadRequestError } from '../errors/app-error.js';

type Schemas = { body?: ZodType; query?: ZodType; params?: ZodType };

export const validate =
  (schemas: Schemas): RequestHandler =>
  (req, _res, next) => {
    try {
      // Express 5-এ req.query read-only getter, তাই parsed ফল req.validated-এ রাখি
      req.validated = {
        body: schemas.body ? schemas.body.parse(req.body ?? {}) : undefined,
        query: schemas.query ? schemas.query.parse(req.query) : undefined,
        params: schemas.params ? schemas.params.parse(req.params) : undefined,
      };
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          new BadRequestError(
            err.issues.map(
              (i) => `${i.path.join('.') || 'input'}: ${i.message}`,
            ),
          ),
        );
      }
      next(err);
    }
  };

export const bodyOf = <T>(req: Request) => req.validated?.body as T;
export const queryOf = <T>(req: Request) => req.validated?.query as T;
export const paramsOf = <T>(req: Request) => req.validated?.params as T;
