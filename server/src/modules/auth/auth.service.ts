// Business logic for authentication. Controllers stay thin and just
// translate HTTP <-> service calls; all the actual rules live here so
// they can be unit tested without touching Express.
import { AuthProvider } from "@/generated/prisma/enums.js";
import argon2 from "argon2";
import crypto from "crypto";
import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/api-error.js";
import {
  resetPasswordTemplate,
  sendMail,
  verifyEmailTemplate,
} from "../../utils/email.js";
import {
  expiryFromNow,
  generateRefreshToken,
  hashToken,
  signAccessToken,
} from "../../utils/jwt.js";
import { LoginInput, RegisterInput } from "./auth.validation.js";

const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  avatarUrl: true,
  provider: true,
  createdAt: true,
} as const;

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

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: expiryFromNow(env.JWT_REFRESH_EXPIRES_IN),
    },
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing)
    throw ApiError.conflict("An account with this email already exists");

  const passwordHash = await argon2.hash(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      provider: AuthProvider.LOCAL,
    },
    select: PUBLIC_USER_SELECT,
  });

  await sendVerificationEmail(user.id, user.email, user.name);

  const tokens = await issueTokenPair(user.id, user.email);
  return { user, ...tokens };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

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
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized("Refresh token is invalid or expired");
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });

  return issueTokenPair(stored.userId, stored.user.email);
}

export async function logout(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revoked: false },
    data: { revoked: true },
  });
}

async function sendVerificationEmail(
  userId: string,
  email: string,
  name: string,
): Promise<void> {
  const rawToken = crypto.randomBytes(32).toString("hex");

  await prisma.verifyUser.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: expiryFromNow("1d"),
    },
  });

  const link = `${env.CLIENT_URL}/verify-email?token=${rawToken}`;
  await sendMail({
    to: email,
    subject: "Verify your email",
    html: verifyEmailTemplate(name, link),
  });
}

export async function verifyEmail(rawToken: string): Promise<void> {
  const record = await prisma.verifyUser.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!record || record.expiresAt < new Date()) {
    throw ApiError.badRequest("Verification link is invalid or has expired");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    }),
    prisma.verifyUser.delete({ where: { id: record.id } }),
  ]);
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success even if the user doesn't exist, so the
  // endpoint can't be used to enumerate registered emails.
  if (!user || user.provider !== AuthProvider.LOCAL) return;

  const rawToken = crypto.randomBytes(32).toString("hex");

  await prisma.resetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: expiryFromNow("1h"),
    },
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
  const record = await prisma.resetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (!record || record.expiresAt < new Date()) {
    throw ApiError.badRequest("Reset link is invalid or has expired");
  }

  const passwordHash = await argon2.hash(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.resetToken.delete({ where: { id: record.id } }),
    // Revoke every existing session - a password reset should log out
    // any device that might have been compromised.
    prisma.refreshToken.updateMany({
      where: { userId: record.userId },
      data: { revoked: true },
    }),
  ]);
}

export async function findOrCreateGoogleUser(profile: {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}) {
  let user = await prisma.user.findUnique({
    where: { googleId: profile.googleId },
  });

  if (!user) {
    // Link to an existing local account with the same email if present,
    // otherwise create a brand new Google-provider account.
    user = await prisma.user.findUnique({ where: { email: profile.email } });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.googleId,
          provider: AuthProvider.GOOGLE,
          avatarUrl: profile.avatarUrl,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: profile.name,
          email: profile.email,
          googleId: profile.googleId,
          provider: AuthProvider.GOOGLE,
          emailVerified: true, // Google already verified this address
          avatarUrl: profile.avatarUrl,
        },
      });
    }
  }

  return issueTokenPair(user.id, user.email).then((tokens) => ({
    user,
    ...tokens,
  }));
}
