import "server-only";

import { redirect } from "next/navigation";
import type { CourseListQuery } from "@/lib/content/validation";
import { readBackend, requireContentAdmin } from "@/lib/content/server";
import {
  normalizeCourse,
  normalizeCourseList,
  type CourseListResponse,
} from "./api";
import type { Course } from "@/lib/types/content";

function buildQuery(query: CourseListQuery): string {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.level) params.set("level", query.level);
  if (query.courseType) params.set("courseType", query.courseType);
  return params.toString();
}

export async function requestCourseList(query: CourseListQuery): Promise<CourseListResponse> {
  try {
    const result = await readBackend(`/courses?${buildQuery(query)}`);
    if (!result.ok) throw new Error("Unable to load courses.");
    return normalizeCourseList(result.data);
  } catch (error) {
    if (error instanceof Error && error.message.includes("service returned an invalid")) {
      throw error;
    }
    throw new Error("Unable to load courses. Please try again.");
  }
}

export async function requestCourseById(id: string): Promise<Course | null> {
  try {
    const result = await readBackend(`/courses/${encodeURIComponent(id)}`);
    if (!result.ok) {
      if (result.status === 404) return null;
      throw new Error("Unable to load course.");
    }
    return normalizeCourse(result.data);
  } catch (error) {
    if (error instanceof Error && error.message.includes("service returned an invalid")) {
      throw error;
    }
    throw new Error("Unable to load course. Please try again.");
  }
}

export async function getCoursesForAdmin(query: CourseListQuery): Promise<CourseListResponse> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) {
    if (authorization.code === "UNAUTHORIZED") redirect("/login");
    if (authorization.code === "FORBIDDEN") redirect("/403");
    throw new Error(authorization.error);
  }
  return requestCourseList(query);
}

export async function getCourseForAdmin(id: string): Promise<Course | null> {
  const authorization = await requireContentAdmin();
  if (!authorization.success) {
    if (authorization.code === "UNAUTHORIZED") redirect("/login");
    if (authorization.code === "FORBIDDEN") redirect("/403");
    throw new Error(authorization.error);
  }
  return requestCourseById(id);
}
