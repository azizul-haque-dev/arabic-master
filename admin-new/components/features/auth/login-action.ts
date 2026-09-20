"use server";

import { loginAction as impl } from "@/actions/auth/login-action";
import { LoginActionResult } from "@/lib/types/auth";

export async function loginAction(input: unknown): Promise<LoginActionResult> {
  return impl(input);
}