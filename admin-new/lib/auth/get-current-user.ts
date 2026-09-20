import { headers } from "next/headers";
import { getAuthSession } from "./session";

export type AdminRole = "ADMIN" | "CONTENT_MANAGER";

export interface CurrentAdminUser {
  userId: string;
  role: AdminRole;
}

export async function getCurrentUser(): Promise<CurrentAdminUser> {
  const headersList = await headers();
  const roleHeader = headersList.get("x-user-role") as AdminRole | null;
  const userIdHeader = headersList.get("x-user-id");

  if (roleHeader && userIdHeader) {
    return { userId: userIdHeader, role: roleHeader };
  }

  const { user } = await getAuthSession();
  if (user && user.id) {
    const role = (user.role as AdminRole) || "ADMIN";
    return { userId: String(user.id), role };
  }

  throw new Error(
    "getCurrentUser() must only be called inside a protected route with an active session."
  );
}