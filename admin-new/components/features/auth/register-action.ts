"use server";

import { registerAction as impl } from "@/actions/auth/register-action";
import { RegisterActionResult } from "@/lib/types/auth";

export async function registerAction(input: unknown): Promise<RegisterActionResult> {
  return impl(input);
}
