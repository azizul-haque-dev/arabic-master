import "server-only";

import { redirect } from "next/navigation";
import type { SectionListQuery } from "@/lib/content/validation";
import { readBackend, requireContentAdmin } from "@/lib/content/server";
import {
  normalizeCourseOptions,
  normalizeSection,
  normalizeSectionList,
  type CourseOption,
  type SectionListResponse,
} from "./api";
import type { Section } from "@/lib/types/content";

function buildQuery(query: SectionListQuery): string {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("limit", String(query.limit));
  if (query.courseId) params.set("courseId", query.courseId);
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  return params.toString();
}

export async function requestSectionList(query: SectionListQuery): Promise<SectionListResponse> {
  try {
    const result = await readBackend(`/sections?${buildQuery(query)}`);
    if (!result.ok) throw new Error("Unable to load sections.");
    return normalizeSectionList(result.data);
  } catch (error) {
    if (error instanceof Error && error.message.includes("service returned an invalid")) {
      throw error;
    }
    throw new Error("Unable to load sections. Please try again.");
  }
}

export async function requestSectionById(id: string): Promise<Section | null> {
  try {
    const result = await readBackend(`/sections/${encodeURIComponent(id)}`);
    if (!result.ok) {
      if (result.status === 404) return null;
      throw new Error("Unable to load section.");
    }
    return normalizeSection(result.data);
  } catch (error) {
    if (error instanceof Error && error.message.includes("service returned an invalid")) {
      throw error;
    }
    throw new Error("Unable to load section. Please try again.");
  }
}

export async function getSectionsForAdmin(query: SectionListQuery): Promise<SectionListResponse> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) {
    if (authorization.code === "UNAUTHORIZED") redirect("/login");
    if (authorization.code === "FORBIDDEN") redirect("/403");
    throw new Error(authorization.error);
  }
  return requestSectionList(query);
}

export async function getSectionForAdmin(id: string): Promise<Section | null> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) {
    if (authorization.code === "UNAUTHORIZED") redirect("/login");
    if (authorization.code === "FORBIDDEN") redirect("/403");
    throw new Error(authorization.error);
  }
  return requestSectionById(id);
}

export async function requestCourseOptions(): Promise<CourseOption[]> {
  try {
    const result = await readBackend("/courses?limit=100");
    if (!result.ok) return [];
    return normalizeCourseOptions(result.data);
  } catch {
    return [];
  }
}

export async function getCourseOptionsForAdmin(): Promise<CourseOption[]> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) return [];
  return requestCourseOptions();
}
