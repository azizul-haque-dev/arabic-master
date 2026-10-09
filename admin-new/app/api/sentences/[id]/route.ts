import { NextRequest, NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/auth/server-api";

async function proxySentenceRequest(request: NextRequest, id: string, method: string, body?: string) {
  const response = await serverApiFetch(`/sentences/${encodeURIComponent(id)}`, {
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxySentenceRequest(request, id, "GET");
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxySentenceRequest(request, id, "PATCH", await request.text());
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxySentenceRequest(request, id, "DELETE");
}
