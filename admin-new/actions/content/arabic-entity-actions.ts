"use server";

import { revalidatePath } from "next/cache";
import type { ContentActionResult } from "@/lib/content/action-result";
import { callBackend, requireContentAdmin, validationFailure } from "@/lib/content/server";
import {
  arabicEntityCreateSchema,
  arabicEntityStatusSchema,
  arabicEntityUpdateSchema,
  contentIdSchema,
  contentListQuerySchema,
  queryFromUnknown,
} from "@/lib/content/validation";
import {
  requestArabicEntityById,
  requestArabicEntityList,
} from "@/lib/arabic-entities/data";
import {
  normalizeArabicEntity,
  type ArabicEntityListResponse,
} from "@/lib/arabic-entities/api";
import type { ArabicEntity, ContentStatus } from "@/lib/types/content";

function toFailure<T>(
  result: Extract<ContentActionResult<unknown>, { success: false }>,
): ContentActionResult<T> {
  return result;
}

function safeFailure<T>(): ContentActionResult<T> {
  return {
    success: false,
    code: "SERVER_ERROR",
    error: "The request could not be completed. Please try again.",
  };
}

export async function listArabicEntitiesAction(
  input: unknown,
): Promise<ContentActionResult<ArabicEntityListResponse>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = contentListQuerySchema.safeParse(queryFromUnknown(input));
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    return { success: true, data: await requestArabicEntityList(parsed.data) };
  } catch {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Unable to load Arabic entities. Please try again.",
    };
  }
}

export async function getArabicEntityAction(
  idInput: unknown,
): Promise<ContentActionResult<ArabicEntity>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);

  try {
    const entity = await requestArabicEntityById(id.data);
    return entity
      ? { success: true, data: entity }
      : { success: false, code: "NOT_FOUND", error: "This Arabic entity no longer exists." };
  } catch {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Unable to load Arabic entity. Please try again.",
    };
  }
}

export async function createArabicEntityAction(
  input: unknown,
): Promise<ContentActionResult<ArabicEntity>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = arabicEntityCreateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const payload = {
      arabicText: parsed.data.arabicText,
      meaningBangla: parsed.data.meaningBangla ?? parsed.data.meaningBn,
      meaningEnglish: parsed.data.meaningEnglish ?? parsed.data.meaningEn,
      pronunciationBangla: parsed.data.pronunciationBangla ?? parsed.data.pronunciationBn,
      pronunciationEnglish: parsed.data.pronunciationEnglish ?? parsed.data.pronunciationEn,
      status: parsed.data.status,
    };

    const response = await callBackend("/arabic-entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.success) return toFailure(response);

    const entity = normalizeArabicEntity(response.data);
    revalidatePath("/admin/arabic-entities");
    return { success: true, data: entity };
  } catch {
    return safeFailure();
  }
}

export async function updateArabicEntityAction(
  idInput: unknown,
  input: unknown,
): Promise<ContentActionResult<ArabicEntity>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);
  const parsed = arabicEntityUpdateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const payload = {
      ...(parsed.data.arabicText !== undefined ? { arabicText: parsed.data.arabicText } : {}),
      ...(parsed.data.meaningBangla !== undefined || parsed.data.meaningBn !== undefined
        ? { meaningBangla: parsed.data.meaningBangla ?? parsed.data.meaningBn }
        : {}),
      ...(parsed.data.meaningEnglish !== undefined || parsed.data.meaningEn !== undefined
        ? { meaningEnglish: parsed.data.meaningEnglish ?? parsed.data.meaningEn }
        : {}),
      ...(parsed.data.pronunciationBangla !== undefined || parsed.data.pronunciationBn !== undefined
        ? { pronunciationBangla: parsed.data.pronunciationBangla ?? parsed.data.pronunciationBn }
        : {}),
      ...(parsed.data.pronunciationEnglish !== undefined || parsed.data.pronunciationEn !== undefined
        ? { pronunciationEnglish: parsed.data.pronunciationEnglish ?? parsed.data.pronunciationEn }
        : {}),
      ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      ...(parsed.data.rejectionReason !== undefined ? { rejectionReason: parsed.data.rejectionReason } : {}),
    };

    const response = await callBackend(`/arabic-entities/${encodeURIComponent(id.data)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.success) return toFailure(response);

    const entity = normalizeArabicEntity(response.data);
    revalidatePath("/admin/arabic-entities");
    revalidatePath(`/admin/arabic-entities/${encodeURIComponent(id.data)}`);
    return { success: true, data: entity };
  } catch {
    return safeFailure();
  }
}

export async function updateArabicEntityStatusAction(
  idInput: unknown,
  status: ContentStatus,
  rejectionReason?: string,
): Promise<ContentActionResult<ArabicEntity>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);

  const parsed = arabicEntityStatusSchema.safeParse({ status, rejectionReason });
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend(`/arabic-entities/${encodeURIComponent(id.data)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!response.success) return toFailure(response);

    const entity = normalizeArabicEntity(response.data);
    revalidatePath("/admin/arabic-entities");
    revalidatePath(`/admin/arabic-entities/${encodeURIComponent(id.data)}`);
    return { success: true, data: entity };
  } catch {
    return safeFailure();
  }
}

export async function deleteArabicEntityAction(
  idInput: unknown,
): Promise<ContentActionResult<null>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);

  const response = await callBackend(`/arabic-entities/${encodeURIComponent(id.data)}`, {
    method: "DELETE",
  });

  if (!response.success) return toFailure(response);

  revalidatePath("/admin/arabic-entities");
  revalidatePath(`/admin/arabic-entities/${encodeURIComponent(id.data)}`);
  return { success: true, data: null };
}
