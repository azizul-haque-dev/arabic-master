"use server";

import { revalidatePath } from "next/cache";
import type { ContentActionResult } from "@/lib/content/action-result";
import { callBackend, requireContentAdmin, validationFailure } from "@/lib/content/server";
import {
  contentIdSchema,
  contentListQuerySchema,
  generateQuerySchema,
  generateWordListQuerySchema,
  queryFromUnknown,
  wordCreateSchema,
  wordUpdateSchema,
} from "@/lib/content/validation";
import { requestWordById, requestWordList } from "@/lib/words/data";
import { normalizeWord, type WordListResponse } from "@/lib/words/api";
import type { Word } from "@/lib/types/content";

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

export async function listWordsAction(input: unknown): Promise<ContentActionResult<WordListResponse>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = contentListQuerySchema.safeParse(queryFromUnknown(input));
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    return { success: true, data: await requestWordList(parsed.data) };
  } catch {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Unable to load words. Please try again.",
    };
  }
}

export async function getWordAction(idInput: unknown): Promise<ContentActionResult<Word>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);

  try {
    const word = await requestWordById(id.data);
    return word
      ? { success: true, data: word }
      : { success: false, code: "NOT_FOUND", error: "This word no longer exists." };
  } catch {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Unable to load word. Please try again.",
    };
  }
}

export async function createWordAction(input: unknown): Promise<ContentActionResult<Word>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = wordCreateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend("/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (!response.success) return toFailure(response);
    const word = normalizeWord(response.data, parsed.data.text);
    revalidatePath("/admin/words");
    revalidatePath("/admin/arabic-entities");
    return { success: true, data: word };
  } catch {
    return safeFailure();
  }
}

export async function generateWordAction(input: unknown): Promise<ContentActionResult<Word>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = generateQuerySchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend("/words/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: parsed.data }),
    });
    if (!response.success) return toFailure(response);
    const word = normalizeWord(response.data);
    revalidatePath("/admin/words");
    return { success: true, data: word };
  } catch {
    return safeFailure();
  }
}

export interface WordBatchResult {
  query: string;
  success: boolean;
  wordId?: string;
  jobId?: string | null;
  queued?: boolean;
  error?: string;
}

export async function generateWordListAction(
  input: unknown,
): Promise<ContentActionResult<WordBatchResult[]>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const rawQueries = Array.isArray(input)
    ? input
    : typeof input === "object" && input !== null && "query" in input && Array.isArray((input as { query: unknown }).query)
      ? (input as { query: unknown }).query
      : input;

  const parsed = generateWordListQuerySchema.safeParse(rawQueries);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend("/words/ai/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: parsed.data }),
    });
    if (!response.success) return toFailure(response);
    revalidatePath("/admin/words");
    return {
      success: true,
      data: Array.isArray(response.data) ? (response.data as WordBatchResult[]) : [],
    };
  } catch {
    return safeFailure();
  }
}

export async function updateWordAction(
  idInput: unknown,
  input: unknown,
): Promise<ContentActionResult<Word>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);
  const parsed = wordUpdateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend(`/words/${encodeURIComponent(id.data)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (!response.success) return toFailure(response);
    const word = normalizeWord(response.data);
    revalidatePath("/admin/words");
    revalidatePath(`/admin/words/${encodeURIComponent(id.data)}`);
    return { success: true, data: word };
  } catch {
    return safeFailure();
  }
}

export async function deleteWordAction(idInput: unknown): Promise<ContentActionResult<null>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);

  const response = await callBackend(`/words/${encodeURIComponent(id.data)}`, { method: "DELETE" });
  if (!response.success) return toFailure(response);
  revalidatePath("/admin/words");
  revalidatePath(`/admin/words/${encodeURIComponent(id.data)}`);
  revalidatePath("/admin/sentences");
  return { success: true, data: null };
}
