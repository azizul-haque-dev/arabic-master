"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Layers, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { ContentPageHeader } from "@/components/shared/content-page-header";
import { ContentSearch } from "@/components/shared/content-search";
import { ContentStatusFilter } from "@/components/shared/content-filters";
import { ContentDataTable, type DataTableColumn } from "@/components/shared/content-data-table";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { SectionFormDialog } from "@/components/features/sections/section-form-dialog";
import { Button } from "@/components/ui/button";
import {
  createSectionAction,
  deleteSectionAction,
  listSectionsAction,
} from "@/actions/content/section-actions";
import type { Section, SectionFormValues, ContentStatus } from "@/lib/types/content";
import type { CourseOption } from "@/lib/sections/api";
import { useRole } from "@/lib/role-context";

const PAGE_LIMIT = 20;

export function SectionListView({
  initialSections = [],
  initialMeta = { page: 1, limit: 20, total: 0, totalPages: 1 },
  courseOptions = [],
}: {
  initialSections?: Section[];
  initialMeta?: { page: number; limit: number; total: number; totalPages: number };
  courseOptions?: CourseOption[];
}) {
  const router = useRouter();
  const { role } = useRole();

  const [sections, setSections] = useState<Section[]>(initialSections);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<ContentStatus>>(new Set());
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [page, setPage] = useState(initialMeta.page);
  const [total, setTotal] = useState(initialMeta.total);
  const [totalPages, setTotalPages] = useState(initialMeta.totalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
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

  // Fetch sections from real API
  useEffect(() => {
    if (firstListEffect.current) {
      firstListEffect.current = false;
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    const selectedStatus = statusFilter.size > 0 ? Array.from(statusFilter)[0] : undefined;

    listSectionsAction({
      page,
      limit: PAGE_LIMIT,
      search: debouncedSearch.trim() || undefined,
      courseId: courseFilter || undefined,
      status: selectedStatus,
    })
      .then((result) => {
        if (!active) return;
        if (result.success) {
          setSections(result.data.items);
          setTotal(result.data.meta.total);
          setTotalPages(result.data.meta.totalPages);
        } else {
          setError(result.error);
          setSections([]);
          setTotal(0);
          setTotalPages(1);
        }
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to load sections. Please try again.");
        setSections([]);
        setTotal(0);
        setTotalPages(1);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, debouncedSearch, statusFilter, courseFilter]);

  const courseMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of courseOptions) {
      map.set(c.id, c.title);
    }
    return map;
  }, [courseOptions]);

  function getCourseTitle(s: Section): string {
    if (s.courseTitle) return s.courseTitle;
    if (s.course?.title) return s.course.title;
    return courseMap.get(s.courseId) ?? "Unknown course";
  }

  function getLessonCount(s: Section): number {
    if (typeof s.lessonCount === "number") return s.lessonCount;
    if (Array.isArray(s.lessons)) return s.lessons.length;
    return 0;
  }

  async function handleCreate(values: SectionFormValues) {
    const result = await createSectionAction(values);
    if (!result.success) {
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        const details = Object.entries(result.fieldErrors)
          .map(([field, errs]) => `${field}: ${errs.join(", ")}`)
          .join(" | ");
        throw new Error(details);
      }
      throw new Error(result.error);
    }
    router.push(`/admin/sections/${result.data.id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const result = await deleteSectionAction(deleteTarget.id);
      if (!result.success) {
        setDeleteError(result.error);
        return;
      }
      setSections((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setDeleteTarget(null);
    } catch {
      setDeleteError("Unable to delete section. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: DataTableColumn<Section>[] = [
    {
      key: "title",
      header: "Section",
      cell: (s) => (
        <div>
          <p className="font-medium text-[var(--color-text)]">{s.title}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{s.sectionKey}</p>
        </div>
      ),
    },
    {
      key: "course",
      header: "Course",
      cell: (s) => (
        <span className="text-[var(--color-text-secondary)]">
          {getCourseTitle(s)}
        </span>
      ),
    },
    {
      key: "order",
      header: "Order",
      cell: (s) => (
        <span className="text-xs text-[var(--color-text-muted)]">#{s.order}</span>
      ),
    },
    {
      key: "lessons",
      header: "Lessons",
      cell: (s) => (
        <span className="text-xs text-[var(--color-text-muted)]">
          {getLessonCount(s)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (s) => <ContentStatusBadge status={s.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (s) => (
        <div className="flex justify-end gap-1" onClick={(ev) => ev.stopPropagation()}>
          {role === "ADMIN" ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${s.sectionKey}`}
              onClick={() => {
                setDeleteError(null);
                setDeleteTarget(s);
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
        title="Sections"
        description="Groups of lessons within a course."
        primaryAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create section
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
            placeholder="Search title or SEC key..."
          />
          <select
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setPage(1);
            }}
            className="h-11 rounded-[var(--radius-default)] border border-[var(--color-border-strong)] bg-white px-3 text-sm focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/10"
          >
            <option value="">All courses</option>
            {courseOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
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
            {total} {total === 1 ? "section" : "sections"}
          </p>
        </div>
      </div>

      {sections.length === 0 && !isLoading ? (
        <EmptyState
          icon={Layers}
          title="No sections found"
          description={
            debouncedSearch || statusFilter.size > 0 || courseFilter
              ? "Try adjusting your filters, or create a new section."
              : "No sections exist yet. Create your first section to get started."
          }
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create section
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <ContentDataTable
            columns={columns}
            rows={sections}
            rowKey={(s) => s.id}
            onRowClick={(s) => router.push(`/admin/sections/${s.id}`)}
            renderMobileCard={(s) => (
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-[var(--color-text)]">{s.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{s.sectionKey}</p>
                  </div>
                  <ContentStatusBadge status={s.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                  <span>{getCourseTitle(s)}</span>
                  <span>{getLessonCount(s)} lessons</span>
                </div>
              </div>
            )}
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

      <SectionFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        courseOptions={courseOptions}
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
        title="Delete this section?"
        description={deleteError || "This action cannot be undone."}
        usageWarning={
          deleteTarget && getLessonCount(deleteTarget) > 0
            ? `This section has ${getLessonCount(deleteTarget)} lesson(s). You must delete or move lessons before deleting this section.`
            : undefined
        }
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}