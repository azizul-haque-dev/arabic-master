import type {
  ContentStatus,
  Section,
  SectionCourseSummary,
  SectionFormValues,
  SectionLessonSummary,
} from "@/lib/types/content";

export interface SectionListResponse {
  items: Section[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CourseOption {
  id: string;
  courseKey: string;
  title: string;
}

export interface SectionCreatePayload {
  courseId: string;
  title: string;
  description: string;
}

export interface SectionUpdatePayload {
  title?: string;
  description?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`The service returned an invalid section record: missing or empty "${key}".`);
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
  throw new Error(`The service returned an invalid content status: "${String(value)}".`);
}

function normalizeDate(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

export function normalizeSectionLesson(raw: unknown): SectionLessonSummary {
  if (!isRecord(raw)) throw new Error("Invalid lesson record in section.");
  return {
    id: requiredString(raw, "id"),
    lessonKey: requiredString(raw, "lessonKey"),
    sectionId: requiredString(raw, "sectionId"),
    title: requiredString(raw, "title"),
    description: typeof raw.description === "string" ? raw.description : "",
    order: typeof raw.order === "number" ? raw.order : 0,
    status: normalizeStatus(raw.status),
    rejectionReason: typeof raw.rejectionReason === "string" ? raw.rejectionReason : null,
    createdById: typeof raw.createdById === "string" ? raw.createdById : null,
    createdAt: normalizeDate(raw.createdAt),
    updatedAt: normalizeDate(raw.updatedAt),
    itemCount: typeof raw.itemCount === "number" ? raw.itemCount : 0,
  };
}

export function normalizeSectionCourse(raw: unknown): SectionCourseSummary | null {
  if (!isRecord(raw)) return null;
  return {
    id: requiredString(raw, "id"),
    courseKey: requiredString(raw, "courseKey"),
    title: requiredString(raw, "title"),
  };
}

export function normalizeSection(raw: unknown): Section {
  if (!isRecord(raw)) throw new Error("The service returned an invalid section record.");

  const rejectionReason = raw.rejectionReason;
  const createdById = raw.createdById;
  const courseTitle = typeof raw.courseTitle === "string" ? raw.courseTitle : undefined;
  const lessonCount = typeof raw.lessonCount === "number" ? raw.lessonCount : undefined;

  let course: SectionCourseSummary | null = null;
  if (isRecord(raw.course)) {
    course = normalizeSectionCourse(raw.course);
  }

  let lessons: SectionLessonSummary[] | undefined = undefined;
  if (Array.isArray(raw.lessons)) {
    lessons = raw.lessons.map(normalizeSectionLesson);
  }

  return {
    id: requiredString(raw, "id"),
    sectionKey: requiredString(raw, "sectionKey"),
    courseId: requiredString(raw, "courseId"),
    title: requiredString(raw, "title"),
    description: typeof raw.description === "string" ? raw.description : "",
    order: typeof raw.order === "number" ? raw.order : 1,
    status: normalizeStatus(raw.status),
    rejectionReason: typeof rejectionReason === "string" ? rejectionReason : undefined,
    createdBy: optionalString(raw.createdBy, createdById) ?? "Admin",
    createdAt: normalizeDate(raw.createdAt),
    updatedAt: normalizeDate(raw.updatedAt),
    courseTitle: courseTitle ?? course?.title,
    lessonCount: lessonCount ?? lessons?.length ?? 0,
    course,
    lessons,
  };
}

export function normalizeSectionList(raw: unknown): SectionListResponse {
  if (!isRecord(raw) || !Array.isArray(raw.items) || !isRecord(raw.meta)) {
    throw new Error("The service returned an invalid section list.");
  }

  const { page, limit, total, totalPages } = raw.meta;
  if (
    typeof page !== "number" ||
    typeof limit !== "number" ||
    typeof total !== "number" ||
    typeof totalPages !== "number"
  ) {
    throw new Error("The service returned invalid section pagination metadata.");
  }

  return {
    items: raw.items.map(normalizeSection),
    meta: { page, limit, total, totalPages },
  };
}

export function normalizeCourseOptions(raw: unknown): CourseOption[] {
  if (!isRecord(raw)) return [];
  const items = Array.isArray(raw.items) ? raw.items : Array.isArray(raw) ? raw : [];
  const options: CourseOption[] = [];
  for (const item of items) {
    if (isRecord(item) && typeof item.id === "string" && typeof item.title === "string") {
      options.push({
        id: item.id,
        courseKey: typeof item.courseKey === "string" ? item.courseKey : item.id,
        title: item.title,
      });
    }
  }
  return options;
}

export function buildSectionCreatePayload(values: SectionFormValues): SectionCreatePayload {
  return {
    courseId: values.courseId.trim(),
    title: values.title.trim(),
    description: values.description.trim(),
  };
}

export function buildSectionUpdatePayload(values: Partial<SectionFormValues>): SectionUpdatePayload {
  const payload: SectionUpdatePayload = {};
  if (values.title !== undefined) payload.title = values.title.trim();
  if (values.description !== undefined) payload.description = values.description.trim();
  return payload;
}
