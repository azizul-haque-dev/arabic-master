import { NextRequest, NextResponse } from "next/server";
import { requireContentAdmin } from "@/lib/content/server";
import { contentIdSchema } from "@/lib/content/validation";
import {
  AUDIO_MAX_FILE_SIZE_BYTES,
  DEFAULT_VARIANT,
  SPEAKER_MAX_LENGTH,
  VARIANT_REGEX,
} from "@/lib/audio/constants";
import { serverApiFetchMultipart } from "@/lib/audio/server-audio";
import { serverApiFetch } from "@/lib/auth/server-api";

interface RouteContext {
  params: Promise<{
    entityId: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
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

  let incomingFormData: FormData;
  try {
    incomingFormData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, message: "Malformed multipart form-data payload." },
      { status: 400 }
    );
  }

  const file = incomingFormData.get("audio") || incomingFormData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json(
      { success: false, message: "No audio file was uploaded in the request." },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { success: false, message: "Uploaded audio file is empty (0 bytes)." },
      { status: 400 }
    );
  }

  if (file.size > AUDIO_MAX_FILE_SIZE_BYTES) {
    const limitMb = Math.round(AUDIO_MAX_FILE_SIZE_BYTES / (1024 * 1024));
    return NextResponse.json(
      {
        success: false,
        message: `Audio file exceeds the maximum permitted size of ${limitMb}MB.`,
      },
      { status: 413 }
    );
  }

  // Parse and validate text parameters
  let variant = DEFAULT_VARIANT;
  const rawVariant = incomingFormData.get("variant");
  if (typeof rawVariant === "string" && rawVariant.trim()) {
    const trimmed = rawVariant.trim().toUpperCase();
    if (!VARIANT_REGEX.test(trimmed)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Variant parameter must be 1-32 alphanumeric characters, hyphens, or underscores.",
        },
        { status: 400 }
      );
    }
    variant = trimmed;
  }

  let speaker: string | undefined;
  const rawSpeaker = incomingFormData.get("speaker");
  if (typeof rawSpeaker === "string" && rawSpeaker.trim()) {
    const trimmed = rawSpeaker.trim();
    if (trimmed.length > SPEAKER_MAX_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          message: `Speaker parameter cannot exceed ${SPEAKER_MAX_LENGTH} characters.`,
        },
        { status: 400 }
      );
    }
    speaker = trimmed;
  }

  // Build clean FormData to forward to backend (never blind-forward client payload)
  const cleanFormData = new FormData();
  cleanFormData.append("audio", file, (file as File).name || "audio.mp3");
  cleanFormData.append("variant", variant);
  if (speaker) {
    cleanFormData.append("speaker", speaker);
  }

  try {
    const backendRes = await serverApiFetchMultipart(
      `/arabic-entities/${encodeURIComponent(entityId)}/audio`,
      cleanFormData,
      "POST"
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

  const searchParams = request.nextUrl.searchParams;
  const rawVariant = searchParams.get("variant") || DEFAULT_VARIANT;
  const variant = rawVariant.trim().toUpperCase();

  if (!VARIANT_REGEX.test(variant)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Variant parameter must be 1-32 alphanumeric characters, hyphens, or underscores.",
      },
      { status: 400 }
    );
  }

  try {
    const backendRes = await serverApiFetch(
      `/arabic-entities/${encodeURIComponent(entityId)}/audio?variant=${encodeURIComponent(variant)}`,
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

export async function DELETE(request: NextRequest, context: RouteContext) {
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

  const searchParams = request.nextUrl.searchParams;
  const rawVariant = searchParams.get("variant") || DEFAULT_VARIANT;
  const variant = rawVariant.trim().toUpperCase();

  if (!VARIANT_REGEX.test(variant)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Variant parameter must be 1-32 alphanumeric characters, hyphens, or underscores.",
      },
      { status: 400 }
    );
  }

  try {
    const backendRes = await serverApiFetch(
      `/arabic-entities/${encodeURIComponent(entityId)}/audio?variant=${encodeURIComponent(variant)}`,
      { method: "DELETE" }
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
