import { NextRequest, NextResponse } from "next/server";
import { requireContentAdmin } from "@/lib/content/server";
import { contentIdSchema } from "@/lib/content/validation";
import { serverApiFetch } from "@/lib/auth/server-api";

interface RouteContext {
  params: Promise<{
    entityId: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireContentAdmin();
  if (!auth.success) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.code === "UNAUTHORIZED" ? 401 : 403 }
    );
  }

  const { entityId } = await context.params;
  const idResult = contentIdSchema.safeParse(entityId);
  if (!idResult.success) {
    return NextResponse.json(
      { success: false, message: "Invalid entity ID parameter." },
      { status: 400 }
    );
  }

  try {
    const backendRes = await serverApiFetch(
      `/arabic-entities/${encodeURIComponent(entityId)}/audio/all`,
      { method: "GET" }
    );

    const body = await backendRes.json().catch(() => null);
    return NextResponse.json(
      body ?? { success: backendRes.ok },
      { status: backendRes.status }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to reach backend audio service." },
      { status: 503 }
    );
  }
}
