"use server";

import { serverApiFetch } from "@/lib/auth/server-api";
import { clearAuthSession } from "@/lib/auth/session";
import { ActionResult } from "@/lib/types/auth";

export async function logoutAction(): Promise<ActionResult<{ message: string }>> {
  try {
    await serverApiFetch("/auth/logout", {
      method: "POST",
    });
  } catch {
    // Continue session cleanup locally even if backend server call fails
  } finally {
    await clearAuthSession();
  }

  return {
    success: true,
    data: { message: "Logged out successfully" },
  };
}
