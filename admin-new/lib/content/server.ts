import "server-only";

import { serverApiFetch } from "@/lib/auth/server-api";
import type { AdminRole } from "@/lib/types/content";
import type { ContentErrorCode, ContentActionResult } from "./action-result";

interface AuthenticatedAdmin {
  id: string;
  role: AdminRole;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function unwrapApiData(payload: unknown): unknown {
  let current = payload;
  while (isRecord(current) && "data" in current) {
    current = current.data;
  }
  return current;
}

export async function responseData(response: Response): Promise<unknown> {
  try {
    return unwrapApiData(await response.json() as unknown);
  } catch {
    return null;
  }
}

export function failureForStatus(status: number): {
  code: ContentErrorCode;
  error: string;
} {
  if (status === 401) return { code: "UNAUTHORIZED", error: "Your session has expired. Please sign in again." };
  if (status === 403) return { code: "FORBIDDEN", error: "You do not have permission to perform this action." };
  if (status === 404) return { code: "NOT_FOUND", error: "This record no longer exists." };
  if (status === 409) return { code: "CONFLICT", error: "This content conflicts with an existing record." };
  if (status === 429) return { code: "RATE_LIMITED", error: "Too many requests. Please wait and try again." };
  if (status >= 500) return { code: "SERVER_ERROR", error: "The service is temporarily unavailable. Please try again." };
  if (status === 400 || status === 422) {
    return { code: "VALIDATION_ERROR", error: "Some fields are missing or invalid. Please review the form." };
  }
  return { code: "SERVER_ERROR", error: "The request could not be completed. Please try again." };
}

export async function requireContentAdmin(
  retryOn401 = true,
): Promise<ContentActionResult<AuthenticatedAdmin>> {
  try {
    const response = await serverApiFetch("/auth/me", { method: "GET" }, retryOn401);
    if (!response.ok) {
      return { success: false, ...failureForStatus(response.status) };
    }
    const user = await responseData(response);
    if (!isRecord(user) || typeof user.id !== "string") {
      return {
        success: false,
        code: "UNAUTHORIZED",
        error: "Your session is invalid. Please sign in again.",
      };
    }
    if (user.role !== "ADMIN" && user.role !== "CONTENT_MANAGER") {
      return {
        success: false,
        code: "FORBIDDEN",
        error: "You do not have permission to perform this action.",
      };
    }
    return { success: true, data: { id: user.id, role: user.role } };
  } catch {
    return {
      success: false,
      code: "NETWORK_ERROR",
      error: "Unable to reach the service. Please try again.",
    };
  }
}

export function validationFailure(issues: readonly { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of issues) {
    const field = issue.path.map(String).join(".") || "form";
    fieldErrors[field] ??= [];
    fieldErrors[field].push(issue.message);
  }
  return {
    success: false as const,
    code: "VALIDATION_ERROR" as const,
    error: "Please correct the highlighted fields.",
    fieldErrors,
  };
}

export async function callBackend(
  endpoint: string,
  init: RequestInit = {},
): Promise<ContentActionResult<unknown>> {
  try {
    const response = await serverApiFetch(endpoint, { ...init, cache: "no-store" });
    if (!response.ok) return { success: false, ...failureForStatus(response.status) };
    return { success: true, data: await responseData(response) };
  } catch {
    return {
      success: false,
      code: "NETWORK_ERROR",
      error: "Unable to reach the service. Please try again.",
    };
  }
}

export async function readBackend(endpoint: string): Promise<{
  ok: true;
  data: unknown;
} | {
  ok: false;
  status: number;
}> {
  const response = await serverApiFetch(endpoint, { cache: "no-store" }, false);
  if (!response.ok) return { ok: false, status: response.status };
  return { ok: true, data: await responseData(response) };
}
