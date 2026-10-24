"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, GraduationCap, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { ContentPageHeader } from "@/components/shared/content-page-header";
import { ContentSearch } from "@/components/shared/content-search";
import { ContentStatusFilter } from "@/components/shared/content-filters";
import { ContentDataTable, type DataTableColumn } from "@/components/shared/content-data-table";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { LessonMetaDialog } from "@/components/features/lessons/lesson-meta-dialog";
import { Button } from "@/components/ui/button";
import {
  createLessonAction,
  deleteLessonAction,
  listLessonsAction,
} from "@/actions/content/lesson-actions";
import type { Lesson, LessonMetaFormValues, ContentStatus } from "@/lib/types/content";
import type { SectionOption } from "@/lib/lessons/api";
import { useRole } from "@/lib/role-context";

const PAGE_LIMIT = 20;

export function LessonListView({
  initialLessons = [],
  initialMeta = { page: 1, limit: 20, total: 0, totalPages: 1 },
  sectionOptions = [],
}: {
  initialLessons?: Lesson[];
  initialMeta?: { page: number; limit: number; total: number; totalPages: number };
  sectionOptions?: SectionOption[];
}) {
  const router = useRouter();
  const { role } = useRole();

  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<ContentStatus>>(new Set());
  const [sectionFilter, setSectionFilter] = useState<string>("");
  const [page, setPage] = useState(initialMeta.page);
  const [total, setTotal] = useState(initialMeta.total);
  const [totalPages, setTotalPages] = useState(initialMeta.totalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const firstListEffect = useRef(true);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch lessons from real API
  useEffect(() => {
    if (firstListEffect.current) {
      firstListEffect.current = false;
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    const selectedStatus = statusFilter.size > 0 ? Array.from(statusFilter)[0] : undefined;

    listLessonsAction({
      page,
      limit: PAGE_LIMIT,
      search: debouncedSearch.trim() || undefined,
      sectionId: sectionFilter || undefined,
      status: selectedStatus,
    })
      .then((result) => {
        if (!active) return;
        if (result.success) {
          setLessons(result.data.items);
          setTotal(result.data.meta.total);
          setTotalPages(result.data.meta.totalPages);
        } else {
          setError(result.error);
          setLessons([]);
          setTotal(0);
          setTotalPages(1);
        }
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to load lessons. Please try again.");
        setLessons([]);
        setTotal(0);
        setTotalPages(1);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, debouncedSearch, statusFilter, sectionFilter]);

  async function handleCreate(values: LessonMetaFormValues) {
    const result = await createLessonAction(values);
    if (!result.success) {
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        const details = Object.entries(result.fieldErrors)
          .map(([field, errs]) => `${field}: ${errs.join(", ")}`)
          .join(" | ");
        throw new Error(details);
      }
      throw new Error(result.error);
    }
    router.push(`/admin/lessons/${result.data.id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const result = await deleteLessonAction(deleteTarget.id);
      if (!result.success) {
        setDeleteError(result.error);
        return;
      }
      setLessons((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setDeleteTarget(null);
    } catch {
      setDeleteError("Unable to delete lesson. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: DataTableColumn<Lesson>[] = [
    {
      key: "title",
      header: "Lesson",
      cell: (l) => (
        <div>
          <p className="font-medium text-[var(--color-text)]">{l.title}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{l.lessonKey}</p>
        </div>
      ),
    },
    {
      key: "curriculum",
      header: "Track",
      cell: (l) => (
        <span className="text-xs text-[var(--color-text-secondary)]">
          {l.courseTitle ? `${l.courseTitle} → ` : ""}
          {l.sectionTitle ?? "Section"}
        </span>
      ),
    },
    {
      key: "items",
      header: "Items",
      cell: (l) => {
        const counts = l.counts ?? { words: 0, sentences: 0, conversations: 0 };
        return (
          <span className="text-xs text-[var(--color-text-muted)]">
            {counts.words}W · {counts.sentences}S · {counts.conversations}C
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (l) => <ContentStatusBadge status={l.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (l) => (
        <div className="flex justify-end gap-1" onClick={(ev) => ev.stopPropagation()}>
          {role === "ADMIN" ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${l.lessonKey}`}
              onClick={() => {
                setDeleteError(null);
                setDeleteTarget(l);
              }}
            >
              <Trash2 className="h-4 w-4 text-[var(--color-text-muted)] hover:text-[var(--color-error)]" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <ContentPageHeader
        title="Lessons"
        description="Core learning units composed of words, sentences, and conversations."
        primaryAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create lesson
          </Button>
        }
      />

      {error ? (
        <div
          role="alert"
          className="rounded-[var(--radius-default)] border border-[var(--color-error)]/20 bg-[var(--color-error-bg)] p-3.5 text-sm text-[var(--color-error-text)]"
        >
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <ContentSearch
            value={search}
            onChange={setSearch}
            placeholder="Search title, track, or LSN key..."
          />
          <select
            value={sectionFilter}
            onChange={(e) => {
              setSectionFilter(e.target.value);
              setPage(1);
            }}
            className="h-11 rounded-[var(--radius-default)] border border-[var(--color-border-strong)] bg-white px-3 text-sm focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/10"
          >
            <option value="">All sections</option>
            {sectionOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.courseTitle ? `${s.courseTitle} → ` : ""}{s.title}
              </option>
            ))}
          </select>
          <ContentStatusFilter
            selected={statusFilter}
            onChange={(selected) => {
              setStatusFilter(selected);
              setPage(1);
            }}
            options={["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"]}
          />
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[var(--color-text-muted)]" />
          ) : null}
          <p className="text-xs text-[var(--color-text-muted)]">
            {total} {total === 1 ? "lesson" : "lessons"}
          </p>
        </div>
      </div>

      {lessons.length === 0 && !isLoading ? (
        <EmptyState
          icon={GraduationCap}
          title="No lessons found"
          description={
            debouncedSearch || statusFilter.size > 0 || sectionFilter
              ? "Try adjusting your filters, or create a new lesson."
              : "No lessons exist yet. Create your first lesson to get started."
          }
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create lesson
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <ContentDataTable
            columns={columns}
            rows={lessons}
            rowKey={(l) => l.id}
            onRowClick={(l) => router.push(`/admin/lessons/${l.id}`)}
            renderMobileCard={(l) => {
              const counts = l.counts ?? { words: 0, sentences: 0, conversations: 0 };
              return (
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{l.title}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{l.lessonKey}</p>
                    </div>
                    <ContentStatusBadge status={l.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                    <span>
                      {l.courseTitle ? `${l.courseTitle} → ` : ""}{l.sectionTitle ?? "Section"}
                    </span>
                    <span>
                      {counts.words}W · {counts.sentences}S · {counts.conversations}C
                    </span>
                  </div>
                </div>
              );
            }}
          />

          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-text-muted)]">
              <span>
                Page {page} of {totalPages} ({total} total)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <LessonMetaDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        sectionOptions={sectionOptions}
        onSave={handleCreate}
      />

      <DeleteConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        title="Delete this lesson?"
        description={deleteError || "This action cannot be undone."}
        usageWarning={
          deleteTarget && (deleteTarget.items?.length ?? 0) > 0
            ? `This lesson has ${deleteTarget.items.length} item(s). Deleting will remove these items from the lesson.`
            : undefined
        }
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}