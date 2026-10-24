import type {
  ContentStatus,
  Course,
  CourseFormValues,
  CourseSectionSummary,
  CourseType,
  DifficultyLevel,
} from "@/lib/types/content";

export interface CourseListResponse {
  items: Course[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CourseCreatePayload {
  title: string;
  description: string;
  level?: DifficultyLevel;
  courseType?: CourseType;
}

export type CourseUpdatePayload = Partial<CourseCreatePayload>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`The service returned an invalid course record: missing or empty "${key}".`);
  }
  return value;
}

function optionalString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string") return value;
  }
  return undefined;
}

function normalizeStatus(value: unknown): ContentStatus {
  if (
    value === "DRAFT" ||
    value === "IN_REVIEW" ||
    value === "APPROVED" ||
    value === "PUBLISHED" ||
    value === "REJECTED" ||
    value === "ARCHIVED"
  ) {
    return value;
  }
  throw new Error(`The service returned an invalid course status: "${String(value)}".`);
}

function normalizeDifficultyLevel(value: unknown): DifficultyLevel {
  if (
    value === "BEGINNER" ||
    value === "ELEMENTARY" ||
    value === "INTERMEDIATE" ||
    value === "ADVANCED"
  ) {
    return value;
  }
  return "BEGINNER";
}

function normalizeCourseType(value: unknown): CourseType {
  if (value === "FREE" || value === "PRO") {
    return value;
  }
  return "FREE";
}

function normalizeDate(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

export function normalizeCourseSection(raw: unknown): CourseSectionSummary {
  if (!isRecord(raw)) throw new Error("Invalid section record in course.");
  return {
    id: requiredString(raw, "id"),
    sectionKey: requiredString(raw, "sectionKey"),
    courseId: requiredString(raw, "courseId"),
    title: requiredString(raw, "title"),
    description: typeof raw.description === "string" ? raw.description : "",
    order: typeof raw.order === "number" ? raw.order : 0,
    status: normalizeStatus(raw.status),
    rejectionReason: typeof raw.rejectionReason === "string" ? raw.rejectionReason : null,
    createdById: typeof raw.createdById === "string" ? raw.createdById : null,
    createdAt: normalizeDate(raw.createdAt),
    updatedAt: normalizeDate(raw.updatedAt),
    lessonCount: typeof raw.lessonCount === "number" ? raw.lessonCount : 0,
  };
}

export function normalizeCourse(raw: unknown): Course {
  if (!isRecord(raw)) throw new Error("The service returned an invalid course record.");

  const rejectionReason = raw.rejectionReason;
  const createdById = raw.createdById;
  const sectionCount = typeof raw.sectionCount === "number" ? raw.sectionCount : undefined;
  const lessonCount = typeof raw.lessonCount === "number" ? raw.lessonCount : undefined;

  let sections: CourseSectionSummary[] | undefined = undefined;
  if (Array.isArray(raw.sections)) {
    sections = raw.sections.map(normalizeCourseSection);
  }

  return {
    id: requiredString(raw, "id"),
    courseKey: requiredString(raw, "courseKey"),
    title: requiredString(raw, "title"),
    description: typeof raw.description === "string" ? raw.description : "",
    level: normalizeDifficultyLevel(raw.level),
    courseType: normalizeCourseType(raw.courseType),
    status: normalizeStatus(raw.status),
    rejectionReason: typeof rejectionReason === "string" ? rejectionReason : undefined,
    createdBy: optionalString(raw.createdBy, createdById) ?? "Admin",
    createdAt: normalizeDate(raw.createdAt),
    updatedAt: normalizeDate(raw.updatedAt),
    sectionCount: sectionCount ?? sections?.length ?? 0,
    lessonCount: lessonCount ?? 0,
    sections,
  };
}

export function normalizeCourseList(raw: unknown): CourseListResponse {
  if (!isRecord(raw) || !Array.isArray(raw.items) || !isRecord(raw.meta)) {
    throw new Error("The service returned an invalid course list.");
  }

  const { page, limit, total, totalPages } = raw.meta;
  if (
    typeof page !== "number" ||
    typeof limit !== "number" ||
    typeof total !== "number" ||
    typeof totalPages !== "number"
  ) {
    throw new Error("The service returned invalid course pagination metadata.");
  }

  return {
    items: raw.items.map(normalizeCourse),
    meta: { page, limit, total, totalPages },
  };
}

export function buildCourseCreatePayload(values: CourseFormValues): CourseCreatePayload {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    level: values.level,
    courseType: values.courseType,
  };
}

export function buildCourseUpdatePayload(values: Partial<CourseFormValues>): CourseUpdatePayload {
  const payload: CourseUpdatePayload = {};
  if (values.title !== undefined) payload.title = values.title.trim();
  if (values.description !== undefined) payload.description = values.description.trim();
  if (values.level !== undefined) payload.level = values.level;
  if (values.courseType !== undefined) payload.courseType = values.courseType;
  return payload;
}
