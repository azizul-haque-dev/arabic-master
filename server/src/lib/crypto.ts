/**
 * Cryptographic Utilities
 * Token hashing and generation
 */

import crypto from "crypto";

/**
 * Generate a cryptographically secure random token
 * Used for refresh tokens and verification tokens
 * @returns Hex string of 48 random bytes
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

/**
 * Hash a token using SHA-256
 * Only the hash is stored in the database for security
 * @param token Raw token string
 * @returns SHA-256 hex hash
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a random UUID for database records
 * @returns UUID v4 string
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
