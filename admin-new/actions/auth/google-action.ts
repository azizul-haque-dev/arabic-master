"use server";

import { redirect } from "next/navigation";
import { getBackendApiUrl } from "@/lib/auth/backend-url";

export async function googleAuthAction() {
  const url = getBackendApiUrl();
  redirect(`${url}/auth/google`);
}
