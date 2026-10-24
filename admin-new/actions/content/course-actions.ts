"use server";

import { revalidatePath } from "next/cache";
import type { ContentActionResult } from "@/lib/content/action-result";
import { callBackend, requireContentAdmin, validationFailure } from "@/lib/content/server";
import {
  contentIdSchema,
  courseCreateSchema,
  courseListQuerySchema,
  courseStatusSchema,
  courseUpdateSchema,
  queryFromUnknown,
  sectionReorderSchema,
} from "@/lib/content/validation";
import { requestCourseById, requestCourseList } from "@/lib/courses/data";
import { normalizeCourse, type CourseListResponse } from "@/lib/courses/api";
import type { ContentStatus, Course } from "@/lib/types/content";

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

export async function listCoursesAction(
  input: unknown,
): Promise<ContentActionResult<CourseListResponse>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = courseListQuerySchema.safeParse(queryFromUnknown(input));
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    return { success: true, data: await requestCourseList(parsed.data) };
  } catch {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Unable to load courses. Please try again.",
    };
  }
}

export async function getCourseAction(
  idInput: unknown,
): Promise<ContentActionResult<Course>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);

  try {
    const course = await requestCourseById(id.data);
    return course
      ? { success: true, data: course }
      : { success: false, code: "NOT_FOUND", error: "This course no longer exists." };
  } catch {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Unable to load course. Please try again.",
    };
  }
}

export async function createCourseAction(
  input: unknown,
): Promise<ContentActionResult<Course>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const parsed = courseCreateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend("/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!response.success) return toFailure(response);

    const course = normalizeCourse(response.data);
    revalidatePath("/admin/courses");
    return { success: true, data: course };
  } catch {
    return safeFailure();
  }
}

export async function updateCourseAction(
  idInput: unknown,
  input: unknown,
): Promise<ContentActionResult<Course>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);
  const parsed = courseUpdateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend(`/courses/${encodeURIComponent(id.data)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!response.success) return toFailure(response);

    const course = normalizeCourse(response.data);
    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${encodeURIComponent(id.data)}`);
    return { success: true, data: course };
  } catch {
    return safeFailure();
  }
}

export async function updateCourseStatusAction(
  idInput: unknown,
  status: ContentStatus,
  rejectionReason?: string,
): Promise<ContentActionResult<Course>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);

  const parsed = courseStatusSchema.safeParse({ status, rejectionReason });
  if (!parsed.success) return validationFailure(parsed.error.issues);

  try {
    const response = await callBackend(`/courses/${encodeURIComponent(id.data)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (!response.success) return toFailure(response);

    const course = normalizeCourse(response.data);
    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${encodeURIComponent(id.data)}`);
    return { success: true, data: course };
  } catch {
    return safeFailure();
  }
}

export async function deleteCourseAction(
  idInput: unknown,
): Promise<ContentActionResult<null>> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return toFailure(authorization);

  if (authorization.data.role !== "ADMIN") {
    return {
      success: false,
      code: "FORBIDDEN",
      error: "Only Administrators can delete courses.",
    };
  }

  const id = contentIdSchema.safeParse(idInput);
  if (!id.success) return validationFailure(id.error.issues);

  try {
    const response = await callBackend(`/courses/${encodeURIComponent(id.data)}`, {
      method: "DELETE",
    });

    if (!response.success) return toFailure(response);

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${encodeURIComponent(id.data)}`);
    return { success: true, data: null };
  } catch {
    return safeFailure();
  }
}

export async function reorderCourseSectionsAction(
  courseIdInput: unknown,
  idsInput: unknown,
): Promise<ContentActionResult<null>> {
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

    revalidatePath("/admin/sections");
    revalidatePath(`/admin/courses/${encodeURIComponent(parsed.data.courseId)}`);
    return { success: true, data: null };
  } catch {
    return safeFailure();
  }
}
