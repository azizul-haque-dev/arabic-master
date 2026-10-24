"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, XCircle, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { ContentActionBar } from "@/components/shared/content-action-bar";
import { RejectionDialog } from "@/components/shared/rejection-dialog";
import { LessonMetaDialog } from "@/components/features/lessons/lesson-meta-dialog";
import { LessonContentPanel } from "@/components/features/lessons/lesson-content-panel";
import { WordSelector } from "@/components/features/lessons/word-selector";
import { SentenceSelector } from "@/components/features/conversations/sentence-selector";
import { ConversationSelector } from "@/components/features/lessons/conversation-selector";
import { SmartWordDialog } from "@/components/features/lessons/smart-word-dialog";
import { Button } from "@/components/ui/button";
import {
  addLessonItemAction,
  removeLessonItemAction,
  reorderLessonItemsAction,
  updateLessonAction,
  updateLessonStatusAction,
} from "@/actions/content/lesson-actions";
import type {
  ContentStatus,
  Lesson,
  LessonContentItem,
  LessonContentType,
  LessonMetaFormValues,
} from "@/lib/types/content";
import type { SectionOption } from "@/lib/lessons/api";
import { useRole } from "@/lib/role-context";

export function LessonDetailView({
  initialLesson,
  sectionOptions = [],
}: {
  initialLesson: Lesson;
  sectionOptions?: SectionOption[];
}) {
  const router = useRouter();
  const { role } = useRole();
  const [lesson, setLesson] = useState(initialLesson);
  const [editMetaOpen, setEditMetaOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [smartWordsOpen, setSmartWordsOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const sectionTitle = lesson.section?.title ?? lesson.sectionTitle ?? "Section";
  const courseTitle = lesson.course?.title ?? lesson.courseTitle ?? "Course";

  async function handleSetStatus(status: ContentStatus, rejectionReason?: string) {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    setActionError(null);
    try {
      const res = await updateLessonStatusAction(lesson.id, status, rejectionReason);
      if (res.success) {
        setLesson((prev) => ({ ...prev, ...res.data }));
        router.refresh();
      } else {
        setActionError(res.error);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to update lesson status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleMetaSave(values: LessonMetaFormValues) {
    setActionError(null);
    const res = await updateLessonAction(lesson.id, {
      title: values.title,
      description: values.description,
    });
    if (!res.success) {
      if (res.fieldErrors && Object.keys(res.fieldErrors).length > 0) {
        const details = Object.entries(res.fieldErrors)
          .map(([field, errs]) => `${field}: ${errs.join(", ")}`)
          .join(" | ");
        throw new Error(details);
      }
      throw new Error(res.error);
    }
    setLesson((prev) => ({ ...prev, ...res.data }));
    router.refresh();
  }

  function itemsOfType(type: LessonContentType): LessonContentItem[] {
    return (lesson.items ?? [])
      .filter((i) => i.contentType === type)
      .sort((a, b) => a.order - b.order);
  }

  async function handleAddItem(type: LessonContentType, contentId: string) {
    setActionError(null);
    const res = await addLessonItemAction(lesson.id, {
      contentType: type,
      contentId,
    });
    if (!res.success) {
      setActionError(res.error);
      return;
    }
    setLesson(res.data);
    router.refresh();
  }

  async function handleRemoveItem(itemId: string) {
    setActionError(null);
    const res = await removeLessonItemAction(lesson.id, itemId);
    if (!res.success) {
      setActionError(res.error);
      return;
    }
    setLesson(res.data);
    router.refresh();
  }

  async function handleReorderType(type: LessonContentType, reordered: LessonContentItem[]) {
    // Preserve orders of other types while applying new ordering
    const otherItems = (lesson.items ?? []).filter((i) => i.contentType !== type);
    const merged = [...otherItems, ...reordered];
    const ids = merged.map((i) => i.id);

    setActionError(null);
    const res = await reorderLessonItemsAction(lesson.id, ids);
    if (!res.success) {
      setActionError(res.error);
      return;
    }
    setLesson(res.data);
    router.refresh();
  }

  const wordItems = useMemo(() => itemsOfType("WORD"), [lesson.items]);
  const sentenceItems = useMemo(() => itemsOfType("SENTENCE"), [lesson.items]);
  const conversationItems = useMemo(() => itemsOfType("CONVERSATION"), [lesson.items]);
  const maxItems = lesson.maxItemsRecommended ?? 10;

  return (
    <div className="flex flex-col gap-6">
      <nav
        className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]"
        aria-label="Breadcrumb"
      >
        <Link href="/admin/lessons" className="hover:text-[var(--color-text)]">
          Lessons
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="text-[var(--color-text-secondary)]">{lesson.lessonKey}</span>
      </nav>

      {actionError ? (
        <div
          role="alert"
          className="flex items-center justify-between rounded-[var(--radius-default)] border border-[var(--color-error)]/20 bg-[var(--color-error-bg)] p-3.5 text-sm text-[var(--color-error-text)]"
        >
          <span>{actionError}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActionError(null)}
            className="text-xs"
          >
            Dismiss
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-text)]">
            {lesson.title}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--color-text-secondary)]">
            {lesson.description || "No description provided."}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--color-text-muted)]">
              {lesson.lessonKey} · {courseTitle} → {sectionTitle}
            </span>
            <ContentStatusBadge status={lesson.status} />
          </div>
        </div>
        <Button variant="secondary" onClick={() => setEditMetaOpen(true)}>
          Edit details
        </Button>
      </div>

      {lesson.status === "REJECTED" && lesson.rejectionReason ? (
        <div className="flex gap-2.5 rounded-[var(--radius-default)] border border-[var(--color-error)]/20 bg-[var(--color-error-bg)] p-3.5 text-sm text-[var(--color-error-text)]">
          <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Reason for rejection</p>
            <p className="mt-0.5">{lesson.rejectionReason}</p>
          </div>
        </div>
      ) : null}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="words">Words ({wordItems.length})</TabsTrigger>
          <TabsTrigger value="sentences">Sentences ({sentenceItems.length})</TabsTrigger>
          <TabsTrigger value="conversations">
            Conversations ({conversationItems.length})
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard label="Words" count={wordItems.length} max={maxItems} />
            <SummaryCard label="Sentences" count={sentenceItems.length} max={maxItems} />
            <SummaryCard label="Conversations" count={conversationItems.length} max={maxItems} />
          </div>

          <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
            <h2 className="font-[var(--font-heading)] text-sm font-semibold text-[var(--color-text)]">
              Review & publishing
            </h2>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Signed in as {role === "ADMIN" ? "Admin" : "Content Manager"} — actions below reflect your role.
            </p>
            <div className="mt-4">
              <ContentActionBar
                role={role}
                status={lesson.status}
                onSaveDraft={
                  lesson.status === "DRAFT"
                    ? () => handleSetStatus("DRAFT")
                    : undefined
                }
                onSubmitForReview={
                  (lesson.items?.length ?? 0) > 0
                    ? () => handleSetStatus("IN_REVIEW")
                    : undefined
                }
                onApprove={() => handleSetStatus("APPROVED")}
                onReject={() => setRejectOpen(true)}
                onPublish={() => handleSetStatus("PUBLISHED")}
              />
              {(lesson.items?.length ?? 0) === 0 ? (
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                  Add at least one word, sentence, or conversation before submitting for review.
                </p>
              ) : null}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="words">
          <LessonContentPanel
            items={wordItems}
            maxRecommended={maxItems}
            addLabel="Add word"
            pickerTitle="Add a word"
            pickerDescription="Search existing words to add to this lesson."
            renderPicker={(onPick) => (
              <WordSelector onSelect={(w) => onPick(w.id)} />
            )}
            renderPreview={(contentId, item) => {
              const preview = item?.preview as any;
              return (
                <Link
                  href={`/admin/words/${contentId}`}
                  className="flex items-center gap-3 hover:underline"
                >
                  <p
                    dir="rtl"
                    lang="ar"
                    className="font-[var(--font-arabic)] text-lg text-[var(--color-text)]"
                  >
                    {preview?.arabicText || "Word"}
                  </p>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {preview?.meaningEn || preview?.meaningBn || ""}
                  </span>
                </Link>
              );
            }}
            onAdd={(id) => handleAddItem("WORD", id)}
            onRemove={handleRemoveItem}
            onReorder={(reordered) => handleReorderType("WORD", reordered)}
            extraAction={
              <button
                type="button"
                onClick={() => setSmartWordsOpen(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-default)] border border-[var(--color-primary)]/30 bg-[var(--color-primary-light)]/10 px-3.5 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-light)]/25"
              >
                <Sparkles className="h-4 w-4" />
                Smart AI add words
              </button>
            }
          />
        </TabsContent>

        <TabsContent value="sentences">
          <LessonContentPanel
            items={sentenceItems}
            maxRecommended={maxItems}
            addLabel="Add sentence"
            pickerTitle="Add a sentence"
            pickerDescription="Search existing sentences to add to this lesson."
            renderPicker={(onPick) => (
              <SentenceSelector onSelect={(s) => onPick(s.id)} />
            )}
            renderPreview={(contentId, item) => {
              const preview = item?.preview as any;
              return (
                <Link
                  href={`/admin/sentences/${contentId}`}
                  className="flex items-center gap-3 hover:underline"
                >
                  <p
                    dir="rtl"
                    lang="ar"
                    className="font-[var(--font-arabic)] text-lg text-[var(--color-text)]"
                  >
                    {preview?.arabicText || "Sentence"}
                  </p>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {preview?.meaningEn || preview?.meaningBn || ""}
                  </span>
                </Link>
              );
            }}
            onAdd={(id) => handleAddItem("SENTENCE", id)}
            onRemove={handleRemoveItem}
            onReorder={(reordered) => handleReorderType("SENTENCE", reordered)}
          />
        </TabsContent>

        <TabsContent value="conversations">
          <LessonContentPanel
            items={conversationItems}
            maxRecommended={maxItems}
            addLabel="Add conversation"
            pickerTitle="Add a conversation"
            pickerDescription="Search existing conversations to add to this lesson."
            renderPicker={(onPick) => (
              <ConversationSelector onSelect={(c) => onPick(c.id)} />
            )}
            renderPreview={(contentId, item) => {
              const preview = item?.preview as any;
              return (
                <Link
                  href={`/admin/conversations/${contentId}`}
                  className="flex items-center gap-3 hover:underline"
                >
                  <p className="font-medium text-[var(--color-text)]">
                    {preview?.title || "Conversation"}
                  </p>
                  {preview?.key ? (
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {preview.key}
                    </span>
                  ) : null}
                </Link>
              );
            }}
            onAdd={(id) => handleAddItem("CONVERSATION", id)}
            onRemove={handleRemoveItem}
            onReorder={(reordered) => handleReorderType("CONVERSATION", reordered)}
          />
        </TabsContent>

        <TabsContent value="settings">
          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 text-xs text-[var(--color-text-muted)]">
            <h2 className="font-[var(--font-heading)] text-sm font-semibold text-[var(--color-text)]">
              Metadata
            </h2>
            <dl className="mt-3 flex flex-col gap-2">
              <div className="flex justify-between">
                <dt>Lesson ID</dt>
                <dd className="font-mono text-[var(--color-text-secondary)]">
                  {lesson.lessonKey}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Section</dt>
                <dd className="text-[var(--color-text-secondary)]">
                  <Link
                    href={`/admin/sections/${lesson.sectionId}`}
                    className="hover:underline"
                  >
                    {sectionTitle}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Course</dt>
                <dd className="text-[var(--color-text-secondary)]">
                  {lesson.courseId ? (
                    <Link
                      href={`/admin/courses/${lesson.courseId}`}
                      className="hover:underline"
                    >
                      {courseTitle}
                    </Link>
                  ) : (
                    courseTitle
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Recommended max per type</dt>
                <dd className="text-[var(--color-text-secondary)]">{maxItems}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Created by</dt>
                <dd className="text-[var(--color-text-secondary)]">
                  {lesson.createdBy}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Last updated</dt>
                <dd className="text-[var(--color-text-secondary)]">
                  {new Date(lesson.updatedAt).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Created at</dt>
                <dd className="text-[var(--color-text-secondary)]">
                  {new Date(lesson.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </section>
        </TabsContent>
      </Tabs>

      <LessonMetaDialog
        open={editMetaOpen}
        onOpenChange={setEditMetaOpen}
        initialLesson={lesson}
        sectionOptions={sectionOptions}
        onSave={handleMetaSave}
      />

      <RejectionDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onSubmit={(reason) => handleSetStatus("REJECTED", reason)}
      />

      <SmartWordDialog
        open={smartWordsOpen}
        onOpenChange={setSmartWordsOpen}
        lessonId={lesson.id}
        onSuccess={(updated) => {
          setLesson(updated);
          router.refresh();
        }}
      />
    </div>
  );
}

function SummaryCard({
  label,
  count,
  max,
}: {
  label: string;
  count: number;
  max: number;
}) {
  const isOver = count > max;
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
        <span
          className={`font-[var(--font-heading)] text-2xl font-bold ${
            isOver ? "text-[var(--color-warning-text)]" : "text-[var(--color-text)]"
          }`}
        >
          {count}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
        Recommended max: {max}
      </p>
    </div>
  );
}