// Database access layer for auth operations.
// All Prisma queries are isolated here for easier testing and potential swapping.

import { prisma } from "../../config/database.js";


const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  avatarUrl: true,
  provider: true,
  createdAt: true,
} as const;

export const AuthRepository = {
  // User lookups
  findUserByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),

  findUserById: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      select: PUBLIC_USER_SELECT,
    }),

  createUser: (data: {
    name: string;
    email: string;
    passwordHash: string;
    provider: "LOCAL" | "GOOGLE";
    googleId?: string | null;
  }) =>
    prisma.user.create({
      data,
      select: PUBLIC_USER_SELECT,
    }),

  // Refresh token operations
  createRefreshToken: (data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) => prisma.refreshToken.create({ data }),

  findRefreshTokenByHash: (tokenHash: string) =>
    prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    }),

  revokeRefreshTokenById: (id: string) =>
    prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    }),

  revokeRefreshTokensByHash: (tokenHash: string) =>
    prisma.refreshToken.updateMany({
      where: { tokenHash, revoked: false },
      data: { revoked: true },
    }),

  // Email verification tokens
  createVerifyToken: (data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) => prisma.verifyUser.create({ data }),

  findVerifyTokenByHash: (tokenHash: string) =>
    prisma.verifyUser.findUnique({
      where: { tokenHash },
    }),

  markUserEmailVerified: (userId: string) =>
    prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
      select: PUBLIC_USER_SELECT,
    }),

  deleteVerifyToken: (id: string) =>
    prisma.verifyUser.delete({ where: { id } }),

  // Password reset tokens
  createResetToken: (data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) => prisma.resetToken.create({ data }),

  findResetTokenByHash: (tokenHash: string) =>
    prisma.resetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    }),

  deleteResetToken: (id: string) =>
    prisma.resetToken.delete({ where: { id } }),

  updateUserPassword: (userId: string, passwordHash: string) =>
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: PUBLIC_USER_SELECT,
    }),

  // Transaction: atomically verify email + cleanup token
  verifyEmailTransaction: (userId: string, tokenId: string) =>
    prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true },
        select: PUBLIC_USER_SELECT,
      }),
      prisma.verifyUser.delete({ where: { id: tokenId } }),
    ]),

  // OAuth user creation/lookup
  findOrCreateGoogleUser: (data: {
    email: string;
    name: string;
    googleId: string;
    avatarUrl?: string;
  }) =>
    prisma.user.upsert({
      where: { email: data.email },
      update: { googleId: data.googleId, avatarUrl: data.avatarUrl },
      create: {
        email: data.email,
        name: data.name,
        googleId: data.googleId,
        provider: "GOOGLE",
        avatarUrl: data.avatarUrl,
        emailVerified: true,
      },
      select: PUBLIC_USER_SELECT,
    }),
};
