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
    let token: string | undefined;

    // 1. Primary Check: Look for the token in browser-based cookies (Web Frontend)
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    // 2. Secondary Check: Fall back to parsing the authorization header (Mobile App / Postman)
    else {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice("Bearer ".length);
      }
    }

    // If neither source provides an access token, stop execution and throw a 401 response status
    if (!token) {
      throw ApiError.unauthorized("Authentication credentials missing");
    }

    try {
      // Decode and validate the cryptographic token payload signature
      const payload = verifyAccessToken(token);

      // Mutate the request interface context with the validated user parameters
      req.user = {
        id: payload.sub,
        email: payload.email,
      };

      // Successfully authenticated. Pass execution to the next controller layer.
      next();
    } catch (error) {
      // An invalid or expired token must throw a 401 error so both web and mobile can catch it and refresh
      throw ApiError.unauthorized("Access token is invalid or expired");
    }
  },
);
