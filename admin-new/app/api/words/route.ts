import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";

const BACKEND_URL = process.env.BACKEND_API_URL || process.env.API_URL || "http://localhost:5000/api/v1";

async function proxyWordRequest(request: NextRequest, method: string, body?: BodyInit) {
  const session = await getAuthSession();
  const headers = new Headers({ "Content-Type": "application/json" });

  if (session.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const requestUrl = `${BACKEND_URL.replace(/\/$/, "")}/words${request.nextUrl.search}`;
  const response = await fetch(requestUrl, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  const responseText = await response.text();
  let responseBody: any = null;

  try {
    responseBody = JSON.parse(responseText);
  } catch {
    responseBody = responseText;
  }

  return NextResponse.json(responseBody ?? { message: "No response body" }, {
    status: response.status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: NextRequest) {
  return proxyWordRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyWordRequest(request, "POST", body);
}
