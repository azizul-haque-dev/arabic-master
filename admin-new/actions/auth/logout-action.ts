"use server";

import { serverApiFetch } from "@/lib/auth/server-api";
import { clearAuthSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export async function logoutAction(): Promise<never> {
  try {
    await serverApiFetch("/auth/logout", {
      method: "POST",
    });
  } catch {
    // Continue session cleanup locally even if backend server call fails
  } finally {
    await clearAuthSession();
  }

  redirect("/login");
}
