"use server";

import { ResetPasswordFormValues, resetPasswordSchema } from "@/schemas/auth.shema";
import { z } from "zod";


export type ResetPasswordActionResult =
  | { success: true; message: string }
  | {
    success: false;
    message: string;
    fieldErrors?: Partial<Record<keyof ResetPasswordFormValues, string[]>>;
    tokenInvalid?: boolean;
  };

const DEFAULT_ERROR_MESSAGE =
  "Unable to reset your password right now. Please try again.";

const apiResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
});

function getApiUrl(): string | null {
  const apiUrl = process.env.API_URL?.trim();
  return apiUrl ? apiUrl.replace(/\/$/, "") : null;
}

export async function resetPasswordAction(
  input: unknown,
): Promise<ResetPasswordActionResult> {
  const parsedInput = resetPasswordSchema.safeParse(input);

  if (!parsedInput.success) {
    const fieldErrors: Partial<Record<keyof ResetPasswordFormValues, string[]>> = {};
    for (const issue of parsedInput.error.issues) {
      const field = issue.path[0];
      if (field === "password" || field === "confirmPassword" || field === "token") {
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
  if (!apiUrl) return { success: false, message: DEFAULT_ERROR_MESSAGE };

  try {
    const response = await fetch(`${apiUrl}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: parsedInput.data.token,
        password: parsedInput.data.password,
      }),
      cache: "no-store",
    });

    let body: z.infer<typeof apiResponseSchema> = {};
    try {
      const parsedBody = apiResponseSchema.safeParse(await response.json());
      if (parsedBody.success) body = parsedBody.data;
    } catch {
      body = {};
    }

    if (response.ok && body.success !== false) {
      return {
        success: true,
        message: body.message ?? "Your password has been reset. You can now sign in.",
      };
    }

    if (response.status === 400) {
      return {
        success: false,
        message: body.message ?? "Please check your details and try again.",
      };
    }

    // Token expired/invalid/already-used — backend যেই status code-ই দিক
    // না কেন (confirm করে নিন), user-কে একই actionable message দেখানো হচ্ছে।
    if (response.status === 401 || response.status === 404 || response.status === 410) {
      return {
        success: false,
        message: "This reset link is invalid or has expired. Please request a new one.",
        tokenInvalid: true,
      };
    }

    return { success: false, message: DEFAULT_ERROR_MESSAGE };
  } catch {
    return { success: false, message: DEFAULT_ERROR_MESSAGE };
  }
}