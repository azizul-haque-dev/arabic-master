"use server";

import { z } from "zod";


export type ForgotPasswordActionResult =
  | { success: true; message: string }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<Record<keyof ForgotPasswordFormValues, string[]>>;
    };

const GENERIC_SUCCESS_MESSAGE =
  "If an account exists for this email, we've sent a password reset link.";
const DEFAULT_ERROR_MESSAGE =
  "Unable to process your request right now. Please try again.";

const apiResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
});

function getApiUrl(): string | null {
  const apiUrl = process.env.API_URL?.trim();
  return apiUrl ? apiUrl.replace(/\/$/, "") : null;
}

export async function forgotPasswordAction(
  input: unknown,
): Promise<ForgotPasswordActionResult> {
  const parsedInput = forgotPasswordSchema.safeParse(input);

  if (!parsedInput.success) {
    const fieldErrors: Partial<Record<keyof ForgotPasswordFormValues, string[]>> = {};
    for (const issue of parsedInput.error.issues) {
      const field = issue.path[0];
      if (field === "email") {
        fieldErrors[field] ??= [];
        fieldErrors[field].push(issue.message);
      }
    }
    return {
      success: false,
      message: "Please correct the highlighted field.",
      fieldErrors,
    };
  }

  const apiUrl = getApiUrl();
  if (!apiUrl) return { success: false, message: DEFAULT_ERROR_MESSAGE };

  try {
    const response = await fetch(`${apiUrl}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedInput.data),
      cache: "no-store",
    });

    let body: z.infer<typeof apiResponseSchema> = {};
    try {
      const parsedBody = apiResponseSchema.safeParse(await response.json());
      if (parsedBody.success) body = parsedBody.data;
    } catch {
      body = {};
    }

    // Security: email exist করে কি না, সেটা কখনোই বোঝানো যাবে না।
    // শুধু "আমার নিজের request-ই ভুল ছিল" (400) আর rate-limit (429)
    // আলাদা করে দেখানো হচ্ছে — বাকি সব status-এ generic success।
    if (response.status === 400) {
      return {
        success: false,
        message: body.message ?? "Please check your details and try again.",
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        message: "Too many requests. Please wait a moment and try again.",
      };
    }

    return {
      success: true,
      message: body.message ?? GENERIC_SUCCESS_MESSAGE,
    };
  } catch {
    return { success: false, message: DEFAULT_ERROR_MESSAGE };
  }
}