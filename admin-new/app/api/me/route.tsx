import { clearAuthSession } from "@/lib/auth/session";
import { serverApiFetch } from "@/lib/auth/server-api";
import { NextResponse } from "next/server";

export async function GET() {
  const response = await serverApiFetch("/auth/me", { method: "GET" });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      await clearAuthSession();
    }
    return NextResponse.json(
      { user: null },
      {
        status: response.status,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const body = await response.json();
  const user = body?.data?.user ?? body?.data ?? body?.user ?? null;

  return NextResponse.json(
    { user },
    { headers: { "Cache-Control": "no-store" } },
  );
}
