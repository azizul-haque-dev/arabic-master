"use server";

import { redirect } from "next/navigation";

export async function googleAuthAction() {
  const backendUrl = process.env.BACKEND_API_URL || process.env.API_URL || "http://localhost:5000/api/v1";
  const url = backendUrl.replace(/\/$/, "");
  redirect(`${url}/auth/google`);
}
