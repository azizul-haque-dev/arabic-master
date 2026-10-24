import "server-only";

import { redirect } from "next/navigation";
import type { LessonListQuery } from "@/lib/content/validation";
import { readBackend, requireContentAdmin } from "@/lib/content/server";
import {
  normalizeLesson,
  normalizeLessonList,
  normalizeSectionOptions,
  type LessonListResponse,
  type SectionOption,
} from "./api";
import type { Lesson } from "@/lib/types/content";

function buildQuery(query: LessonListQuery): string {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("limit", String(query.limit));
  if (query.sectionId) params.set("sectionId", query.sectionId);
  if (query.courseId) params.set("courseId", query.courseId);
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  return params.toString();
}

export async function requestLessonList(query: LessonListQuery): Promise<LessonListResponse> {
  try {
    const result = await readBackend(`/lessons?${buildQuery(query)}`);
    if (!result.ok) throw new Error("Unable to load lessons.");
    return normalizeLessonList(result.data);
  } catch (error) {
    if (error instanceof Error && error.message.includes("service returned an invalid")) {
      throw error;
    }
    throw new Error("Unable to load lessons. Please try again.");
  }
}

export async function requestLessonById(id: string): Promise<Lesson | null> {
  try {
    const result = await readBackend(`/lessons/${encodeURIComponent(id)}`);
    if (!result.ok) {
      if (result.status === 404) return null;
      throw new Error("Unable to load lesson.");
    }
    return normalizeLesson(result.data);
  } catch (error) {
    if (error instanceof Error && error.message.includes("service returned an invalid")) {
      throw error;
    }
    throw new Error("Unable to load lesson. Please try again.");
  }
}

export async function getLessonsForAdmin(query: LessonListQuery): Promise<LessonListResponse> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) {
    if (authorization.code === "UNAUTHORIZED") redirect("/login");
    if (authorization.code === "FORBIDDEN") redirect("/403");
    throw new Error(authorization.error);
  }
  return requestLessonList(query);
}

export async function getLessonForAdmin(id: string): Promise<Lesson | null> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) {
    if (authorization.code === "UNAUTHORIZED") redirect("/login");
    if (authorization.code === "FORBIDDEN") redirect("/403");
    throw new Error(authorization.error);
  }
  return requestLessonById(id);
}

export async function requestSectionOptions(): Promise<SectionOption[]> {
  try {
    const result = await readBackend("/sections?limit=100");
    if (!result.ok) return [];
    return normalizeSectionOptions(result.data);
  } catch {
    return [];
  }
}

export async function getSectionOptionsForAdmin(): Promise<SectionOption[]> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return [];
  return requestSectionOptions();
}
