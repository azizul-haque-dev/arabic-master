"use server";

import { revalidatePath } from "next/cache";
import type { ContentActionResult } from "@/lib/content/action-result";
import { callBackend, requireContentAdmin, validationFailure } from "@/lib/content/server";
import {
  contentIdSchema,
  contentListQuerySchema,
  generateQuerySchema,
  queryFromUnknown,
  sentenceCreateSchema,
  sentenceUpdateSchema,
} from "@/lib/content/validation";
import { requestSentenceById, requestSentenceList } from "@/lib/sentences/data";
import { normalizeSentence, type SentenceListResponse } from "@/lib/sentences/api";
import type { Sentence } from "@/lib/types/content";

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

export async function listSentencesAction(
  input: unknown,
): Promise<ContentActionResult<SentenceListResponse>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = contentListQuerySchema.safeParse(queryFromUnknown(input));
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    return { success: true, data: await requestSentenceList(parsed.data) };
  } catch {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Unable to load sentences. Please try again.",
    };
  }
}

export async function getSentenceAction(idInput: unknown): Promise<ContentActionResult<Sentence>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);

  try {
    const sentence = await requestSentenceById(id.data);
    return sentence
      ? { success: true, data: sentence }
      : { success: false, code: "NOT_FOUND", error: "This sentence no longer exists." };
  } catch {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Unable to load sentence. Please try again.",
    };
  }
}

export async function createSentenceAction(input: unknown): Promise<ContentActionResult<Sentence>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = sentenceCreateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend("/sentences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (!response.success) return toFailure(response);
    const sentence = normalizeSentence(response.data);
    revalidatePath("/admin/sentences");
    return { success: true, data: sentence };
  } catch {
    return safeFailure();
  }
}

export async function updateSentenceAction(
  idInput: unknown,
  input: unknown,
): Promise<ContentActionResult<Sentence>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);
  const parsed = sentenceUpdateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend(`/sentences/${encodeURIComponent(id.data)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (!response.success) return toFailure(response);
    const sentence = normalizeSentence(response.data);
    revalidatePath("/admin/sentences");
    revalidatePath(`/admin/sentences/${encodeURIComponent(id.data)}`);
    return { success: true, data: sentence };
  } catch {
    return safeFailure();
  }
}

export async function deleteSentenceAction(idInput: unknown): Promise<ContentActionResult<null>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);
  const response = await callBackend(`/sentences/${encodeURIComponent(id.data)}`, { method: "DELETE" });
  if (!response.success) return toFailure(response);
  revalidatePath("/admin/sentences");
  revalidatePath(`/admin/sentences/${encodeURIComponent(id.data)}`);
  revalidatePath("/admin/conversations");
  revalidatePath("/admin/lessons");
  return { success: true, data: null };
}

export async function generateSentenceAction(input: unknown): Promise<ContentActionResult<Sentence>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = generateQuerySchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend("/sentences/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: parsed.data }),
    });
    if (!response.success) return toFailure(response);
    const sentence = normalizeSentence(response.data);
    revalidatePath("/admin/sentences");
    return { success: true, data: sentence };
  } catch {
    return safeFailure();
  }
}

export async function resyncSentenceWordsAction(idInput: unknown): Promise<ContentActionResult<null>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);
  const response = await callBackend(`/sentences/${encodeURIComponent(id.data)}/resync-words`, {
    method: "POST",
  });
  if (!response.success) return toFailure(response);
  revalidatePath(`/admin/sentences/${encodeURIComponent(id.data)}`);
  return { success: true, data: null };
}
