"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ContentActionResult } from "@/lib/content/action-result";
import { callBackend, requireContentAdmin, validationFailure } from "@/lib/content/server";
import {
  arabicEntityCreateSchema,
  arabicEntityListQuerySchema,
  arabicEntityStatusSchema,
  arabicEntityUpdateSchema,
  contentIdSchema,
  generateQuerySchema,
  generateWordListQuerySchema,
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

const generatedEntityResponseSchema = z.strictObject({
  entity: z.unknown(),
  created: z.boolean(),
});

const generatedEntityBatchResponseSchema = z.array(
  z.discriminatedUnion("success", [
    z.strictObject({
      query: z.string(),
      success: z.literal(true),
      entity: z.unknown(),
      created: z.boolean(),
    }),
    z.strictObject({
      query: z.string(),
      success: z.literal(false),
      error: z.string(),
    }),
  ]),
);

export interface ArabicEntityGenerationResult {
  entity: ArabicEntity;
  created: boolean;
}

export type ArabicEntityGenerationBatchResult =
  | ({ query: string; success: true } & ArabicEntityGenerationResult)
  | { query: string; success: false; error: string };

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

export async function generateArabicEntityAction(
  input: unknown,
): Promise<ContentActionResult<ArabicEntityGenerationResult>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = generateQuerySchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend("/arabic-entities/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: parsed.data }),
    });
    if (!response.success) return toFailure(response);

    const result = generatedEntityResponseSchema.safeParse(response.data);
    if (!result.success) {
      console.error("[generateArabicEntityAction] Invalid AI response:", result.error);
      return safeFailure();
    }

    revalidatePath("/admin/arabic-entities");
    return {
      success: true,
      data: {
        entity: normalizeArabicEntity(result.data.entity),
        created: result.data.created,
      },
    };
  } catch {
    return safeFailure();
  }
}

export async function generateArabicEntityListAction(
  input: unknown,
): Promise<ContentActionResult<ArabicEntityGenerationBatchResult[]>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = generateWordListQuerySchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend("/arabic-entities/ai/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: parsed.data }),
    });
    if (!response.success) return toFailure(response);

    const result = generatedEntityBatchResponseSchema.safeParse(response.data);
    if (!result.success) {
      console.error("[generateArabicEntityListAction] Invalid AI response:", result.error);
      return safeFailure();
    }

    revalidatePath("/admin/arabic-entities");
    return {
      success: true,
      data: result.data.map((item) =>
        item.success
          ? {
              query: item.query,
              success: true as const,
              entity: normalizeArabicEntity(item.entity),
              created: item.created,
            }
          : item,
      ),
    };
  } catch {
    return safeFailure();
  }
}

export async function listArabicEntitiesAction(
  input: unknown,
): Promise<ContentActionResult<ArabicEntityListResponse>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = arabicEntityListQuerySchema.safeParse(queryFromUnknown(input));
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
