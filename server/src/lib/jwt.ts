/**
 * JWT Token Management
 * Handles access token signing/verification and refresh token generation
 */

import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "@/config/env.js";
import { generateRefreshToken, hashToken } from "./crypto.js";

export interface AccessTokenPayload {
  sub: string; // user id
  email: string;
}

/**
 * Sign a new access token JWT
 * @param payload Token payload containing user id and email
 * @returns Signed JWT string
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

/**
 * Verify and decode an access token JWT
 * @param token JWT string to verify
 * @returns Decoded payload
 * @throws If token is invalid or expired
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

/**
 * Turns "7d" / "15m" style durations into a Date for DB expiry columns
 * @param duration Duration string like "7d", "15m", "1h", "30s"
 * @returns Date object representing the expiry time
 */
export function expiryFromNow(duration: string): Date {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);

  const value = Number(match[1]);
  const unit = match[2];
  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return new Date(Date.now() + value * unitMs[unit]);
}

/**
 * Re-export crypto utilities for convenience in jwt module
 */
export { generateRefreshToken, hashToken };
