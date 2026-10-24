import type {
  ContentStatus,
  Lesson,
  LessonContentItem,
  LessonContentType,
  LessonMetaFormValues,
  LessonSectionSummary,
  LessonTypeCounts,
  SectionCourseSummary,
} from "@/lib/types/content";

export interface LessonListResponse {
  items: Lesson[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SectionOption {
  id: string;
  sectionKey: string;
  title: string;
  courseTitle?: string;
}

export interface LessonCreatePayload {
  sectionId: string;
  title: string;
  description: string;
}

export interface LessonUpdatePayload {
  title?: string;
  description?: string;
}

export interface LessonItemPayload {
  contentType: LessonContentType;
  contentId: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`The service returned an invalid lesson record: missing or empty "${key}".`);
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
  throw new Error(`The service returned an invalid lesson status: "${String(value)}".`);
}

function normalizeContentType(value: unknown): LessonContentType {
  if (value === "WORD" || value === "SENTENCE" || value === "CONVERSATION") {
    return value;
  }
  return "WORD";
}

function normalizeDate(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

export function normalizeLessonItem(raw: unknown): LessonContentItem {
  if (!isRecord(raw)) throw new Error("Invalid lesson item record.");
  return {
    id: requiredString(raw, "id"),
    order: typeof raw.order === "number" ? raw.order : 1,
    contentType: normalizeContentType(raw.contentType),
    contentId: optionalString(raw.contentId, raw.wordId, raw.sentenceId, raw.conversationId) ?? "",
    preview: raw.preview,
  };
}

export function normalizeLessonSection(raw: unknown): LessonSectionSummary | null {
  if (!isRecord(raw)) return null;
  return {
    id: requiredString(raw, "id"),
    sectionKey: requiredString(raw, "sectionKey"),
    title: requiredString(raw, "title"),
    courseId: typeof raw.courseId === "string" ? raw.courseId : "",
  };
}

export function normalizeLessonCourse(raw: unknown): SectionCourseSummary | null {
  if (!isRecord(raw)) return null;
  return {
    id: requiredString(raw, "id"),
    courseKey: requiredString(raw, "courseKey"),
    title: requiredString(raw, "title"),
  };
}

export function normalizeLesson(raw: unknown): Lesson {
  if (!isRecord(raw)) throw new Error("The service returned an invalid lesson record.");

  const rejectionReason = raw.rejectionReason;
  const createdById = raw.createdById;
  const sectionTitle = typeof raw.sectionTitle === "string" ? raw.sectionTitle : undefined;
  const courseId = typeof raw.courseId === "string" ? raw.courseId : undefined;
  const courseTitle = typeof raw.courseTitle === "string" ? raw.courseTitle : undefined;

  let items: LessonContentItem[] = [];
  if (Array.isArray(raw.items)) {
    items = raw.items.map(normalizeLessonItem);
  }

  let counts: LessonTypeCounts | undefined = undefined;
  if (isRecord(raw.counts)) {
    counts = {
      words: typeof raw.counts.words === "number" ? raw.counts.words : 0,
      sentences: typeof raw.counts.sentences === "number" ? raw.counts.sentences : 0,
      conversations: typeof raw.counts.conversations === "number" ? raw.counts.conversations : 0,
    };
  } else if (items.length > 0) {
    counts = {
      words: items.filter((i) => i.contentType === "WORD").length,
      sentences: items.filter((i) => i.contentType === "SENTENCE").length,
      conversations: items.filter((i) => i.contentType === "CONVERSATION").length,
    };
  }

  let section: LessonSectionSummary | null = null;
  if (isRecord(raw.section)) {
    section = normalizeLessonSection(raw.section);
  }

  let course: SectionCourseSummary | null = null;
  if (isRecord(raw.course)) {
    course = normalizeLessonCourse(raw.course);
  }

  return {
    id: requiredString(raw, "id"),
    lessonKey: requiredString(raw, "lessonKey"),
    sectionId: requiredString(raw, "sectionId"),
    title: requiredString(raw, "title"),
    description: typeof raw.description === "string" ? raw.description : "",
    items,
    maxItemsRecommended:
      typeof raw.maxItemsRecommended === "number" ? raw.maxItemsRecommended : 10,
    status: normalizeStatus(raw.status),
    rejectionReason: typeof rejectionReason === "string" ? rejectionReason : undefined,
    createdBy: optionalString(raw.createdBy, createdById) ?? "Admin",
    createdAt: normalizeDate(raw.createdAt),
    updatedAt: normalizeDate(raw.updatedAt),
    sectionTitle: sectionTitle ?? section?.title,
    courseId: courseId ?? section?.courseId,
    courseTitle: courseTitle ?? course?.title,
    counts: counts ?? { words: 0, sentences: 0, conversations: 0 },
    section,
    course,
  };
}

export function normalizeLessonList(raw: unknown): LessonListResponse {
  if (!isRecord(raw) || !Array.isArray(raw.items) || !isRecord(raw.meta)) {
    throw new Error("The service returned an invalid lesson list.");
  }

  const { page, limit, total, totalPages } = raw.meta;
  if (
    typeof page !== "number" ||
    typeof limit !== "number" ||
    typeof total !== "number" ||
    typeof totalPages !== "number"
  ) {
    throw new Error("The service returned invalid lesson pagination metadata.");
  }

  return {
    items: raw.items.map(normalizeLesson),
    meta: { page, limit, total, totalPages },
  };
}

export function normalizeSectionOptions(raw: unknown): SectionOption[] {
  if (!isRecord(raw)) return [];
  const items = Array.isArray(raw.items) ? raw.items : Array.isArray(raw) ? raw : [];
  const options: SectionOption[] = [];
  for (const item of items) {
    if (isRecord(item) && typeof item.id === "string" && typeof item.title === "string") {
      options.push({
        id: item.id,
        sectionKey: typeof item.sectionKey === "string" ? item.sectionKey : item.id,
        title: item.title,
        courseTitle: typeof item.courseTitle === "string" ? item.courseTitle : undefined,
      });
    }
  }
  return options;
}

export function buildLessonCreatePayload(values: LessonMetaFormValues): LessonCreatePayload {
  return {
    sectionId: values.sectionId.trim(),
    title: values.title.trim(),
    description: values.description?.trim() ?? "",
  };
}

export function buildLessonUpdatePayload(values: Partial<LessonMetaFormValues>): LessonUpdatePayload {
  const payload: LessonUpdatePayload = {};
  if (values.title !== undefined) payload.title = values.title.trim();
  if (values.description !== undefined) payload.description = values.description.trim();
  return payload;
}
