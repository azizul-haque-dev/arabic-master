// Protects routes by requiring a valid access token in the
// Authorization header ("Bearer <token>").
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { verifyAccessToken } from "../utils/jwt.js";

// Declared on Express.User (not Request directly) so this merges cleanly
// with passport's own type augmentation instead of conflicting with it.
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
    }
  }
}

export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Missing or invalid authorization header");
    }

    const token = header.slice("Bearer ".length);

    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, email: payload.email };
      next();
    } catch {
      throw ApiError.unauthorized("Access token is invalid or expired");
    }
  },
);

// Attaches the user if a valid token is present, but never blocks the request.
// Useful for endpoints that return different data for logged-in users.
export const optionalAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      try {
        const payload = verifyAccessToken(header.slice("Bearer ".length));
        req.user = { id: payload.sub, email: payload.email };
      } catch {
        // Invalid token on an optional route is simply ignored.
      }
    }
    next();
  },
);
