"use server";

import { revalidatePath } from "next/cache";
import type { ContentActionResult } from "@/lib/content/action-result";
import { callBackend, requireContentAdmin, validationFailure } from "@/lib/content/server";
import {
  contentIdSchema,
  queryFromUnknown,
  sectionCreateSchema,
  sectionListQuerySchema,
  sectionReorderSchema,
  sectionStatusSchema,
  sectionUpdateSchema,
} from "@/lib/content/validation";
import {
  requestCourseOptions,
  requestSectionById,
  requestSectionList,
} from "@/lib/sections/data";
import {
  normalizeSection,
  type CourseOption,
  type SectionListResponse,
} from "@/lib/sections/api";
import type { ContentStatus, Section } from "@/lib/types/content";

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

export async function listSectionsAction(
  input: unknown,
): Promise<ContentActionResult<SectionListResponse>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = sectionListQuerySchema.safeParse(queryFromUnknown(input));
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    return { success: true, data: await requestSectionList(parsed.data) };
  } catch {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Unable to load sections. Please try again.",
    };
  }
}

export async function getSectionAction(
  idInput: unknown,
): Promise<ContentActionResult<Section>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);

  try {
    const section = await requestSectionById(id.data);
    return section
      ? { success: true, data: section }
      : { success: false, code: "NOT_FOUND", error: "This section no longer exists." };
  } catch {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Unable to load section. Please try again.",
    };
  }
}

export async function createSectionAction(
  input: unknown,
): Promise<ContentActionResult<Section>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = sectionCreateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const payload = {
      courseId: parsed.data.courseId,
      title: parsed.data.title,
      description: parsed.data.description,
    };

    const response = await callBackend("/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.success) return toFailure(response);

    const section = normalizeSection(response.data);
    revalidatePath("/admin/sections");
    revalidatePath("/admin/courses");
    return { success: true, data: section };
  } catch {
    return safeFailure();
  }
}

export async function updateSectionAction(
  idInput: unknown,
  input: unknown,
): Promise<ContentActionResult<Section>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);
  const parsed = sectionUpdateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend(`/sections/${encodeURIComponent(id.data)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!response.success) return toFailure(response);

    const section = normalizeSection(response.data);
    revalidatePath("/admin/sections");
    revalidatePath(`/admin/sections/${encodeURIComponent(id.data)}`);
    return { success: true, data: section };
  } catch {
    return safeFailure();
  }
}

export async function updateSectionStatusAction(
  idInput: unknown,
  status: ContentStatus,
  rejectionReason?: string,
): Promise<ContentActionResult<Section>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);

  const parsed = sectionStatusSchema.safeParse({ status, rejectionReason });
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend(`/sections/${encodeURIComponent(id.data)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!response.success) return toFailure(response);

    const section = normalizeSection(response.data);
    revalidatePath("/admin/sections");
    revalidatePath(`/admin/sections/${encodeURIComponent(id.data)}`);
    return { success: true, data: section };
  } catch {
    return safeFailure();
  }
}

export async function deleteSectionAction(
  idInput: unknown,
): Promise<ContentActionResult<null>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  if (authorization.data.role !== "ADMIN") {
    return {
      success: false,
      code: "FORBIDDEN",
      error: "Only Administrators can delete sections.",
    };
  }

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);

  try {
    const response = await callBackend(`/sections/${encodeURIComponent(id.data)}`, {
      method: "DELETE",
    });

    if (!response.success) return toFailure(response);

    revalidatePath("/admin/sections");
    revalidatePath(`/admin/sections/${encodeURIComponent(id.data)}`);
    revalidatePath("/admin/courses");
    return { success: true, data: null };
  } catch {
    return safeFailure();
  }
}

export async function reorderSectionsAction(
  courseIdInput: unknown,
  idsInput: unknown,
): Promise<ContentActionResult<Section[]>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = sectionReorderSchema.safeParse({
    courseId: courseIdInput,
    ids: idsInput,
  });
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend(
      `/courses/${encodeURIComponent(parsed.data.courseId)}/sections/reorder`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: parsed.data.ids }),
      },
    );

    if (!response.success) return toFailure(response);

    const list = Array.isArray(response.data)
      ? response.data.map(normalizeSection)
      : [];
    revalidatePath("/admin/sections");
    revalidatePath(`/admin/courses/${encodeURIComponent(parsed.data.courseId)}`);
    return { success: true, data: list };
  } catch {
    return safeFailure();
  }
}

export async function getCourseOptionsAction(): Promise<
  ContentActionResult<CourseOption[]>
> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  try {
    const options = await requestCourseOptions();
    return { success: true, data: options };
  } catch {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Unable to load courses. Please try again.",
    };
  }
}
