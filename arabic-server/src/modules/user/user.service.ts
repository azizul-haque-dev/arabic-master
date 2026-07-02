import { prisma } from "../../config/database.js";
import { ApiError } from "../../utils/api-error.js";

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

export async function getById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: PUBLIC_USER_SELECT,
  });
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

export async function updateProfile(
  userId: string,
  data: { name?: string; avatarUrl?: string },
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: PUBLIC_USER_SELECT,
  });
}
