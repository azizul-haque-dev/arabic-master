"use server";

import { loginSchema } from "@/components/features/auth/login-schema";
import { mapHttpError, serverApiFetch } from "@/lib/auth/server-api";
import { setAuthSession } from "@/lib/auth/session";
import {
  ActionFieldErrors,
  LoginActionResult,
  SafeUser,
} from "@/lib/types/auth";

export async function loginAction(
  input: { email: string, password: string }
): Promise<LoginActionResult> {
  // 1. Validate form input
  const result = loginSchema.safeParse(input);

  if (!result.success) {
    const fieldErrors: ActionFieldErrors = {};

    for (const issue of result.error.issues) {
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
    // 2. Send login request to backend
    const response = await serverApiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(result.data),
    });
    // 3. Read backend response
    const body = await response.json();

    // 4. Login successful
    if (response.ok) {
      const user: SafeUser = body?.data?.user;

      await setAuthSession({
        accessToken: body?.data?.accessToken,
        refreshToken: body?.data?.refreshToken,
        user,
      });

      return {
        success: true,
        data: {
          user,
        },
      };
    }

    // 5. Login failed
    const message = Array.isArray(body.message)
      ? body.message[0]
      : body.message;

    const fieldErrors: ActionFieldErrors | undefined =
      response.status === 400 && Array.isArray(body.message)
        ? { form: body.message }
        : undefined;

    return mapHttpError(
      response.status,
      message,
      fieldErrors
    );
  } catch {
    // 6. Backend/network error
    return {
      success: false,
      error: "Unable to connect to authentication server. Please try again.",
      code: "NETWORK_ERROR",
    };
  }
}
