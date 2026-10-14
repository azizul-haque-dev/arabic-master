// Protects routes by requiring a valid access token in the
// Authorization header ("Bearer <token>").
import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/app-error.js";

import { asyncHandler } from "../http/async-handler.js";
import { TokenService } from "../../modules/auth/token.service.js";
import { UserService } from "../../modules/users/user.service.js";

export const authenticate = asyncHandler(
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
      throw new UnauthorizedError("Authentication credentials missing");
    }

    try {
      // Decode and validate the cryptographic token payload signature
      const payload = TokenService.verifyAccessToken(token);
      if (payload.type !== "access") {
        throw new UnauthorizedError("Invalid token type");
      }

      const user = await UserService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedError("User no longer exists");
      }

      // Mutate the request interface context for downstream controllers and middleware
      req.auth = {
        userId: user.id,
        sessionId: payload.sessionId,
        jwtId: payload.jwtId,
        role: user.role,
      };


      // Successfully authenticated. Pass execution to the next controller layer.
      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      // An invalid or expired token must throw a 401 error so both web and mobile can catch it and refresh
      throw new UnauthorizedError("Access token is invalid or expired");
    }
  },
);
