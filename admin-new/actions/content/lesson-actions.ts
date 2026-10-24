"use server";

import { revalidatePath } from "next/cache";
import type { ContentActionResult } from "@/lib/content/action-result";
import { callBackend, requireContentAdmin, validationFailure } from "@/lib/content/server";
import {
  contentIdSchema,
  lessonAddItemSchema,
  lessonCreateSchema,
  lessonListQuerySchema,
  lessonReorderItemsSchema,
  lessonStatusSchema,
  lessonUpdateSchema,
  queryFromUnknown,
} from "@/lib/content/validation";
import {
  requestLessonById,
  requestLessonList,
  requestSectionOptions,
} from "@/lib/lessons/data";
import {
  normalizeLesson,
  type LessonListResponse,
  type SectionOption,
} from "@/lib/lessons/api";
import type { ContentStatus, Lesson } from "@/lib/types/content";

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

export async function listLessonsAction(
  input: unknown,
): Promise<ContentActionResult<LessonListResponse>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = lessonListQuerySchema.safeParse(queryFromUnknown(input));
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    return { success: true, data: await requestLessonList(parsed.data) };
  } catch {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Unable to load lessons. Please try again.",
    };
  }
}

export async function getLessonAction(
  idInput: unknown,
): Promise<ContentActionResult<Lesson>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);

  try {
    const lesson = await requestLessonById(id.data);
    return lesson
      ? { success: true, data: lesson }
      : { success: false, code: "NOT_FOUND", error: "This lesson no longer exists." };
  } catch {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Unable to load lesson. Please try again.",
    };
  }
}

export async function createLessonAction(
  input: unknown,
): Promise<ContentActionResult<Lesson>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = lessonCreateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend("/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sectionId: parsed.data.sectionId,
        title: parsed.data.title,
        description: parsed.data.description ?? "",
      }),
    });

    if (!response.success) return toFailure(response);

    const lesson = normalizeLesson(response.data);
    revalidatePath("/admin/lessons");
    revalidatePath("/admin/sections");
    return { success: true, data: lesson };
  } catch {
    return safeFailure();
  }
}

export async function updateLessonAction(
  idInput: unknown,
  input: unknown,
): Promise<ContentActionResult<Lesson>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);
  const parsed = lessonUpdateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  const payload: { title?: string; description?: string } = {};
  if (parsed.data.title !== undefined) payload.title = parsed.data.title;
  if (parsed.data.description !== undefined) payload.description = parsed.data.description ?? "";

  try {
    const response = await callBackend(`/lessons/${encodeURIComponent(id.data)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.success) return toFailure(response);

    const lesson = normalizeLesson(response.data);
    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/lessons/${encodeURIComponent(id.data)}`);
    return { success: true, data: lesson };
  } catch {
    return safeFailure();
  }
}

export async function updateLessonStatusAction(
  idInput: unknown,
  status: ContentStatus,
  rejectionReason?: string,
): Promise<ContentActionResult<Lesson>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);

  const parsed = lessonStatusSchema.safeParse({ status, rejectionReason });
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend(`/lessons/${encodeURIComponent(id.data)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!response.success) return toFailure(response);

    const lesson = normalizeLesson(response.data);
    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/lessons/${encodeURIComponent(id.data)}`);
    return { success: true, data: lesson };
  } catch {
    return safeFailure();
  }
}

export async function deleteLessonAction(
  idInput: unknown,
): Promise<ContentActionResult<null>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  if (authorization.data.role !== "ADMIN") {
    return {
      success: false,
      code: "FORBIDDEN",
      error: "Only Administrators can delete lessons.",
    };
  }

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);

  try {
    const response = await callBackend(`/lessons/${encodeURIComponent(id.data)}`, {
      method: "DELETE",
    });

    if (!response.success) return toFailure(response);

    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/lessons/${encodeURIComponent(id.data)}`);
    revalidatePath("/admin/sections");
    return { success: true, data: null };
  } catch {
    return safeFailure();
  }
}

export async function addLessonItemAction(
  lessonIdInput: unknown,
  input: unknown,
): Promise<ContentActionResult<Lesson>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(lessonIdInput);
  if (!id.success) return validationFailure(id.error.issues);

  const parsed = lessonAddItemSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend(`/lessons/${encodeURIComponent(id.data)}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!response.success) return toFailure(response);

    const lesson = normalizeLesson(response.data);
    revalidatePath(`/admin/lessons/${encodeURIComponent(id.data)}`);
    return { success: true, data: lesson };
  } catch {
    return safeFailure();
  }
}

export async function removeLessonItemAction(
  lessonIdInput: unknown,
  itemIdInput: unknown,
): Promise<ContentActionResult<Lesson>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const lessonId = contentIdSchema.safeParse(lessonIdInput);
  if (!lessonId.success) return validationFailure(lessonId.error.issues);

  const itemId = contentIdSchema.safeParse(itemIdInput);
  if (!itemId.success) return validationFailure(itemId.error.issues);

  try {
    const response = await callBackend(
      `/lessons/${encodeURIComponent(lessonId.data)}/items/${encodeURIComponent(itemId.data)}`,
      { method: "DELETE" },
    );

    if (!response.success) return toFailure(response);

    const lesson = normalizeLesson(response.data);
    revalidatePath(`/admin/lessons/${encodeURIComponent(lessonId.data)}`);
    return { success: true, data: lesson };
  } catch {
    return safeFailure();
  }
}

export async function reorderLessonItemsAction(
  lessonIdInput: unknown,
  idsInput: unknown,
): Promise<ContentActionResult<Lesson>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const lessonId = contentIdSchema.safeParse(lessonIdInput);
  if (!lessonId.success) return validationFailure(lessonId.error.issues);

  const parsed = lessonReorderItemsSchema.safeParse({ ids: idsInput });
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend(
      `/lessons/${encodeURIComponent(lessonId.data)}/items/reorder`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: parsed.data.ids }),
      },
    );

    if (!response.success) return toFailure(response);

    const lesson = normalizeLesson(response.data);
    revalidatePath(`/admin/lessons/${encodeURIComponent(lessonId.data)}`);
    return { success: true, data: lesson };
  } catch {
    return safeFailure();
  }
}

export async function getSectionOptionsAction(): Promise<
  ContentActionResult<SectionOption[]>
> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  try {
    const options = await requestSectionOptions();
    return { success: true, data: options };
  } catch {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Unable to load sections. Please try again.",
    };
  }
}

export async function smartAddWordsToLessonAction(
  lessonIdInput: unknown,
  wordsInput: unknown,
): Promise<
  ContentActionResult<{
    summary: { total: number; added: number; alreadyInLesson: number; failed: number };
    results: Array<{
      query: string;
      wordId?: string;
      wordKey?: string;
      status: "added" | "already_in_lesson" | "failed";
      createdViaAi?: boolean;
      error?: string;
    }>;
    lesson: Lesson;
  }>
> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(lessonIdInput);
  if (!id.success) return validationFailure(id.error.issues);

  const words = Array.isArray(wordsInput)
    ? wordsInput.map(String).map((w) => w.trim()).filter(Boolean)
    : typeof wordsInput === "string"
    ? wordsInput
        .split(/[\n,]+/)
        .map((w) => w.trim())
        .filter(Boolean)
    : [];

  if (words.length === 0) {
    return {
      success: false,
      code: "VALIDATION_ERROR",
      error: "Please enter at least one word to add.",
    };
  }

  try {
    const response = await callBackend(
      `/lessons/${encodeURIComponent(id.data)}/words`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words }),
      },
    );

    if (!response.success) return toFailure(response);

    const data = response.data as any;
    const lesson = normalizeLesson(data.lesson);
    revalidatePath(`/admin/lessons/${encodeURIComponent(id.data)}`);
    return {
      success: true,
      data: {
        summary: data.summary,
        results: data.results,
        lesson,
      },
    };
  } catch {
    return safeFailure();
  }
}
