"use server";

import { z } from "zod";
import { registerSchema, type RegisterFormValues } from "./register-schema";

export type RegisterActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<Record<keyof RegisterFormValues, string[]>>;
    };

const DEFAULT_ERROR_MESSAGE =
  "Unable to create your account right now. Please try again.";

const apiResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
});

function getApiUrl(): string | null {
  const apiUrl = process.env.API_URL?.trim();
  return apiUrl ? apiUrl.replace(/\/$/, "") : null;
}

export async function registerAction(
  input: unknown,
): Promise<RegisterActionResult> {
  const parsedInput = registerSchema.safeParse(input);

  if (!parsedInput.success) {
    const fieldErrors: Partial<
      Record<keyof RegisterFormValues, string[]>
    > = {};

    for (const issue of parsedInput.error.issues) {
      const field = issue.path[0];
      if (field === "name" || field === "email" || field === "password") {
        fieldErrors[field] ??= [];
        fieldErrors[field].push(issue.message);
      }
    }

    return {
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  const apiUrl = getApiUrl();
  if (!apiUrl) {
    return { success: false, message: DEFAULT_ERROR_MESSAGE };
  }

  try {
    const response = await fetch(`${apiUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedInput.data),
      cache: "no-store",
    });

    let body: z.infer<typeof apiResponseSchema> = {};
    try {
      const json: unknown = await response.json();
      const parsedBody = apiResponseSchema.safeParse(json);
      if (parsedBody.success) body = parsedBody.data;
    } catch {
      body = {};
    }

    if (response.ok && body.success !== false) {
      return {
        success: true,
        message:
          body.message ??
          "Account created. Please check your email to verify your account.",
      };
    }

    if (response.status === 409) {
      return {
        success: false,
        message: "An account with this email already exists.",
        fieldErrors: { email: ["An account with this email already exists."] },
      };
    }

    if (response.status === 400) {
      return {
        success: false,
        message: body.message ?? "Please check your details and try again.",
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: "You are not authorized to create an account.",
      };
    }

    return { success: false, message: DEFAULT_ERROR_MESSAGE };
  } catch {
    return { success: false, message: DEFAULT_ERROR_MESSAGE };
  }
}
