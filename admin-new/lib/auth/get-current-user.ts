import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { serverApiFetch } from "./server-api";

export type AdminRole = "ADMIN" | "CONTENT_MANAGER";

export interface CurrentAdminUser {
  userId: string;
  role: AdminRole;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function getCurrentUser(): Promise<CurrentAdminUser> {
  const response = await serverApiFetch("/auth/me", { method: "GET" });
  if (response.status === 401) {
    redirect("/login");
  }
  if (response.status === 503) {
    const requestHeaders = await headers();
    const returnTo =
      requestHeaders.get("x-app-path") || "/admin/arabic-entities";
    redirect(`/session-unavailable?returnTo=${encodeURIComponent(returnTo)}`);
  }
  if (!response.ok) redirect("/403");

  const body: unknown = await response.json();
  const data = isRecord(body) && "data" in body ? body.data : body;
  const user = isRecord(data) && "user" in data ? data.user : data;
  if (
    !isRecord(user) ||
    typeof user.id !== "string" ||
    (user.role !== "ADMIN" && user.role !== "CONTENT_MANAGER")
  ) {
    redirect("/403");
  }

  return { userId: user.id, role: user.role };
}