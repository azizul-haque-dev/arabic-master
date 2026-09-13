"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { loginSchema, type LoginFormValues } from "./login-schema";

export type LoginActionResult =
  | { success: true; message: string }
  | {
      success: false;
      message: string;
      fieldErrors?: Partial<Record<keyof LoginFormValues, string[]>>;
    };

const DEFAULT_ERROR_MESSAGE =
  "Unable to sign you in right now. Please try again.";

const apiResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
});

function getApiUrl(): string | null {
  const apiUrl = process.env.API_URL?.trim();
  return apiUrl ? apiUrl.replace(/\/$/, "") : null;
}

async function forwardAuthCookies(response: Response): Promise<void> {
  const setCookies = response.headers.getSetCookie();
  if (setCookies.length === 0) return;

  const cookieStore = await cookies();
  for (const setCookie of setCookies) {
    const [nameValue] = setCookie.split(";", 1);
    const separator = nameValue.indexOf("=");
    if (separator < 1) continue;

    cookieStore.set({
      name: nameValue.slice(0, separator),
      value: nameValue.slice(separator + 1),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
  }
}

export async function loginAction(input: unknown): Promise<LoginActionResult> {
  const parsedInput = loginSchema.safeParse(input);

  if (!parsedInput.success) {
    const fieldErrors: Partial<Record<keyof LoginFormValues, string[]>> = {};
    for (const issue of parsedInput.error.issues) {
      const field = issue.path[0];
      if (field === "email" || field === "password") {
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
    const response = await fetch(`${apiUrl}/auth/login`, {
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

    if (response.ok && body.success !== false) {
      await forwardAuthCookies(response);
      return {
        success: true,
        message: body.message ?? "Signed in successfully.",
      };
    }

    if (response.status === 401) {
      return { success: false, message: "Invalid email or password." };
    }

    if (response.status === 403) {
      return { success: false, message: "You are not authorized to sign in." };
    }

    if (response.status === 400) {
      return {
        success: false,
        message: body.message ?? "Please check your details and try again.",
      };
    }

    return { success: false, message: DEFAULT_ERROR_MESSAGE };
  } catch {
    return { success: false, message: DEFAULT_ERROR_MESSAGE };
  }
}