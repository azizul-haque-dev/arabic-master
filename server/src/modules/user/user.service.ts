import { ApiError } from "@/lib/api-error.js";
import { UserRepository } from "./user.repository.js";

export async function getById(userId: string) {
  const user = await UserRepository.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

export async function updateProfile(
  userId: string,
  data: { name?: string; avatarUrl?: string },
) {
  return UserRepository.update(userId, data);
}
