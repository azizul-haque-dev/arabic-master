import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/auth/server-api";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await serverApiFetch(`/sentences/${encodeURIComponent(id)}/resync-words`, {
    method: "POST",
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
