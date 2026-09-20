"use server";

import { registerSchema } from "@/components/features/auth/register-schema";
import { mapHttpError, serverApiFetch } from "@/lib/auth/server-api";
import { setAuthSession } from "@/lib/auth/session";
import {
  ActionFieldErrors,
  RegisterActionData,
  RegisterActionResult,
  SafeUser,
} from "@/lib/types/auth";

export async function registerAction(input: unknown): Promise<RegisterActionResult> {
  const parsedInput = registerSchema.safeParse(input);

  if (!parsedInput.success) {
    const fieldErrors: ActionFieldErrors = {};
    for (const issue of parsedInput.error.issues) {
      const field = String(issue.path[0] || "form");
      fieldErrors[field] ??= [];
      fieldErrors[field].push(issue.message);
    }

    return {
      success: false,
      error: "Please fix the highlighted fields",
      code: "VALIDATION_ERROR",
      fieldErrors,
    };
  }

  try {
    const response = await serverApiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        fullName: parsedInput.data.name,
        email: parsedInput.data.email,
        password: parsedInput.data.password,
      }),
    });

    let body: Record<string, unknown> = {};
    try {
      body = (await response.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    if (response.ok) {
      const user: SafeUser = (body.user as SafeUser) || {
        id: (body.id as string) || "user",
        email: parsedInput.data.email,
        name: parsedInput.data.name,
        role: body.role as string,
      };

      if (body.accessToken) {
        await setAuthSession({
          accessToken: body.accessToken as string,
          refreshToken: body.refreshToken as string,
          user,
        });
      }

      return {
        success: true,
        data: { user },
      };
    }

    if (response.status === 409) {
      return {
        success: false,
        error: "An account with this email already exists.",
        code: "EMAIL_ALREADY_EXISTS",
        fieldErrors: { email: ["An account with this email already exists."] },
      };
    }

    const message = Array.isArray(body.message) ? body.message[0] : body.message;
    return mapHttpError(response.status, message);
  } catch {
    return {
      success: false,
      error: "Unable to connect to authentication server. Please try again.",
      code: "NETWORK_ERROR",
    };
  }
}
