import { getAuthSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getAuthSession();

  return NextResponse.json(
    {
      user: session.user ?? null,
      accessToken: session.accessToken ?? null,
      refreshToken: session.refreshToken ?? null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
