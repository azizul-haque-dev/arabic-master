// Database access layer for user operations.

import { prisma } from "../../config/database.js";


const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  avatarUrl: true,
  provider: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const UserRepository = {
  findById: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      select: PUBLIC_USER_SELECT,
    }),

  update: (id: string, data: { name?: string; avatarUrl?: string }) =>
    prisma.user.update({
      where: { id },
      data,
      select: PUBLIC_USER_SELECT,
    }),
};
