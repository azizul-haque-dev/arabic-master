import argon2 from "argon2";
import crypto from "crypto";
import { env } from "../../config/env.js";

import { ApiError } from "@/lib/api-error.js";
import {
  resetPasswordTemplate,
  sendMail,
  verifyEmailTemplate,
} from "@/integrations/email.js";
import {
  expiryFromNow,
  generateRefreshToken,
  hashToken,
  signAccessToken,
} from "@/lib/jwt.js";
import { AUTH, TOKEN_EXPIRY } from "@/shared/constants.js";
import { LoginInput, RegisterInput } from "./auth.validation.js";
import { AuthRepository } from "./auth.repository.js";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Issues a fresh access token + refresh token, persisting the refresh
// token's hash so it can be revoked/rotated later.
async function issueTokenPair(
  userId: string,
  email: string,
): Promise<TokenPair> {
  const accessToken = signAccessToken({ sub: userId, email });
  const refreshToken = generateRefreshToken();

  await AuthRepository.createRefreshToken({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: expiryFromNow(env.JWT_REFRESH_EXPIRES_IN),
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput) {
  const existing = await AuthRepository.findUserByEmail(input.email);
  if (existing)
    throw ApiError.conflict("An account with this email already exists");

  const passwordHash = await argon2.hash(input.password);

  const user = await AuthRepository.createUser({
    name: input.name,
    email: input.email,
    passwordHash,
    provider: "LOCAL",
  });

  await sendVerificationEmail(user.id, user.email, user.name);

  const tokens = await issueTokenPair(user.id, user.email);
  return { user, ...tokens };
}

export async function login(input: LoginInput) {
  const user = await AuthRepository.findUserByEmail(input.email);

  if (!user || !user.passwordHash) {
    // Same message whether the email doesn't exist or the account uses
    // Google sign-in, to avoid leaking which emails are registered.
    throw ApiError.unauthorized("Invalid email or password");
  }

  const passwordValid = await argon2.verify(user.passwordHash, input.password);
  if (!passwordValid) throw ApiError.unauthorized("Invalid email or password");

  const tokens = await issueTokenPair(user.id, user.email);

  const { passwordHash: _omit, googleId: _omit2, ...publicUser } = user;
  return { user: publicUser, ...tokens };
}

// Rotates a refresh token: the old one is revoked and a new pair is
// issued. Rotation limits the damage if a refresh token is stolen,
// since reuse of a revoked token can be detected.
export async function refreshTokens(rawToken: string): Promise<TokenPair> {
  const tokenHash = hashToken(rawToken);
  const stored = await AuthRepository.findRefreshTokenByHash(tokenHash);

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized("Refresh token is invalid or expired");
  }

  await AuthRepository.revokeRefreshTokenById(stored.id);

  return issueTokenPair(stored.userId, stored.user.email);
}

export async function logout(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  await AuthRepository.revokeRefreshTokensByHash(tokenHash);
}

async function sendVerificationEmail(
  userId: string,
  email: string,
  name: string,
): Promise<void> {
  const rawToken = crypto.randomBytes(AUTH.TOKEN_BYTES).toString("hex");

  await AuthRepository.createVerifyToken({
    userId,
    tokenHash: hashToken(rawToken),
    expiresAt: expiryFromNow(TOKEN_EXPIRY.VERIFY_EMAIL),
  });

  const link = `${env.CLIENT_URL}/verify-email?token=${rawToken}`;
  await sendMail({
    to: email,
    subject: "Verify your email",
    html: verifyEmailTemplate(name, link),
  });
}

export async function verifyEmail(rawToken: string): Promise<void> {
  const record = await AuthRepository.findVerifyTokenByHash(
    hashToken(rawToken),
  );

  if (!record || record.expiresAt < new Date()) {
    throw ApiError.badRequest("Verification link is invalid or has expired");
  }

  await AuthRepository.verifyEmailTransaction(record.userId, record.id);
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await AuthRepository.findUserByEmail(email);
  // Always return success even if the user doesn't exist, so the
  // endpoint can't be used to enumerate registered emails.
  if (!user || user.provider !== "LOCAL") return;

  const rawToken = crypto.randomBytes(AUTH.TOKEN_BYTES).toString("hex");

  await AuthRepository.createResetToken({
    userId: user.id,
    tokenHash: hashToken(rawToken),
    expiresAt: expiryFromNow(TOKEN_EXPIRY.PASSWORD_RESET),
  });

  const link = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
  await sendMail({
    to: user.email,
    subject: "Reset your password",
    html: resetPasswordTemplate(user.name, link),
  });
}

export async function resetPassword(
  rawToken: string,
  newPassword: string,
): Promise<void> {
  const record = await AuthRepository.findResetTokenByHash(
    hashToken(rawToken),
  );

  if (!record || record.expiresAt < new Date()) {
    throw ApiError.badRequest("Reset link is invalid or has expired");
  }

  const passwordHash = await argon2.hash(newPassword);

  await AuthRepository.updateUserPassword(record.userId, passwordHash);
  await AuthRepository.deleteResetToken(record.id);

  // Revoke every existing session - a password reset should log out
  // any device that might have been compromised.
  // TODO: Add method to revoke all user refresh tokens
  // await AuthRepository.revokeAllUserTokens(record.userId);
}

export async function findOrCreateGoogleUser(profile: {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}) {
  const user = await AuthRepository.findOrCreateGoogleUser({
    email: profile.email,
    name: profile.name,
    googleId: profile.googleId,
    avatarUrl: profile.avatarUrl,
  });

  return issueTokenPair(user.id, user.email).then((tokens) => ({
    user,
    ...tokens,
  }));
}
