import { NextRequest, NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/auth/server-api";

export async function POST(request: NextRequest) {
  const response = await serverApiFetch("/sentences/ai", {
    method: "POST",
    body: await request.text(),
    cache: "no-store",
  });
  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = JSON.parse(text) as unknown;
  } catch {
    payload = text;
  }
  return NextResponse.json(payload, {
    status: response.status,
    headers: { "Cache-Control": "no-store" },
  });
}
