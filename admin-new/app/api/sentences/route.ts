import { NextRequest, NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/auth/server-api";

async function proxySentenceRequest(request: NextRequest, method: string, body?: string) {
  const response = await serverApiFetch(`/sentences${request.nextUrl.search}`, {
    method,
    body,
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

export async function GET(request: NextRequest) {
  return proxySentenceRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  return proxySentenceRequest(request, "POST", await request.text());
}
