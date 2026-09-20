"use server";

import { mapHttpError, serverApiFetch } from "@/lib/auth/server-api";
import { ActionResult, SafeUser } from "@/lib/types/auth";

export async function meAction(): Promise<ActionResult<SafeUser>> {
  try {
    const response = await serverApiFetch("/auth/me", {
      method: "GET",
    });

    if (response.ok) {
      const user = await response.json();
      return {
        success: true,
        data: user,
      };
    }

    return mapHttpError(response.status);
  } catch {
    return {
      success: false,
      error: "Unable to reach authentication service.",
      code: "NETWORK_ERROR",
    };
  }
}
