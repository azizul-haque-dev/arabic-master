"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { ContentPageHeader } from "@/components/shared/content-page-header";
import { ContentSearch } from "@/components/shared/content-search";
import { ContentStatusFilter } from "@/components/shared/content-filters";
import { ContentDataTable, type DataTableColumn } from "@/components/shared/content-data-table";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { CourseFormDialog } from "@/components/features/courses/course-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createCourseAction,
  deleteCourseAction,
  listCoursesAction,
} from "@/actions/content/course-actions";
import type { Course, CourseFormValues, ContentStatus } from "@/lib/types/content";
import { DIFFICULTY_LABEL } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";

const PAGE_LIMIT = 20;

export function CourseListView({
  initialCourses = [],
  initialMeta = { page: 1, limit: 20, total: 0, totalPages: 1 },
}: {
  initialCourses?: Course[];
  initialMeta?: { page: number; limit: number; total: number; totalPages: number };
}) {
  const router = useRouter();
  const { role } = useRole();

  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<ContentStatus>>(new Set());
  const [page, setPage] = useState(initialMeta.page);
  const [total, setTotal] = useState(initialMeta.total);
  const [totalPages, setTotalPages] = useState(initialMeta.totalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
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

  // Fetch courses from real API
  useEffect(() => {
    if (firstListEffect.current) {
      firstListEffect.current = false;
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    const selectedStatus = statusFilter.size > 0 ? Array.from(statusFilter)[0] : undefined;

    listCoursesAction({
      page,
      limit: PAGE_LIMIT,
      search: debouncedSearch.trim() || undefined,
      status: selectedStatus,
    })
      .then((result) => {
        if (!active) return;
        if (result.success) {
          setCourses(result.data.items);
          setTotal(result.data.meta.total);
          setTotalPages(result.data.meta.totalPages);
        } else {
          setError(result.error);
          setCourses([]);
          setTotal(0);
          setTotalPages(1);
        }
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to load courses. Please try again.");
        setCourses([]);
        setTotal(0);
        setTotalPages(1);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, debouncedSearch, statusFilter]);

  async function handleCreate(values: CourseFormValues) {
    const result = await createCourseAction(values);
    if (!result.success) {
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        const details = Object.entries(result.fieldErrors)
          .map(([field, errs]) => `${field}: ${errs.join(", ")}`)
          .join(" | ");
        throw new Error(details);
      }
      throw new Error(result.error);
    }
    router.push(`/admin/courses/${result.data.id}`);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const result = await deleteCourseAction(deleteTarget.id);
      if (!result.success) {
        setDeleteError(result.error);
        return;
      }
      setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setDeleteTarget(null);
    } catch {
      setDeleteError("Unable to delete course. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: DataTableColumn<Course>[] = [
    {
      key: "title",
      header: "Course",
      cell: (c) => (
        <div>
          <p className="font-medium text-[var(--color-text)]">{c.title}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{c.courseKey}</p>
        </div>
      ),
    },
    {
      key: "level",
      header: "Level",
      cell: (c) => (
        <Badge className="bg-[var(--color-neutral-bg)] text-[var(--color-neutral-text)]">
          {DIFFICULTY_LABEL[c.level]}
        </Badge>
      ),
    },
    {
      key: "access",
      header: "Access",
      cell: (c) => (
        <Badge
          className={
            c.courseType === "PRO"
              ? "bg-[var(--color-accent-light)] text-[var(--color-accent)]"
              : "bg-[var(--color-success-bg)] text-[var(--color-success-text)]"
          }
        >
          {c.courseType === "PRO" ? "Pro" : "Free"}
        </Badge>
      ),
    },
    {
      key: "content",
      header: "Content",
      cell: (c) => (
        <span className="text-xs text-[var(--color-text-muted)]">
          {c.sectionCount ?? 0} sections · {c.lessonCount ?? 0} lessons
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => <ContentStatusBadge status={c.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (c) => (
        <div className="flex justify-end gap-1" onClick={(ev) => ev.stopPropagation()}>
          {role === "ADMIN" ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${c.courseKey}`}
              onClick={() => {
                setDeleteError(null);
                setDeleteTarget(c);
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
        title="Courses"
        description="Top-level curriculum tracks. Free tracks contain free words and sentences; Pro tracks follow a structured path."
        primaryAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create course
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
            placeholder="Search title, description, or CRS key..."
          />
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
            {total} {total === 1 ? "course" : "courses"}
          </p>
        </div>
      </div>

      {courses.length === 0 && !isLoading ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description={
            debouncedSearch || statusFilter.size > 0
              ? "Try adjusting your filters, or create a new course."
              : "No courses exist yet. Create your first course to get started."
          }
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create course
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <ContentDataTable
            columns={columns}
            rows={courses}
            rowKey={(c) => c.id}
            onRowClick={(c) => router.push(`/admin/courses/${c.id}`)}
            renderMobileCard={(c) => (
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-[var(--color-text)]">{c.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{c.courseKey}</p>
                  </div>
                  <ContentStatusBadge status={c.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                  <span>{DIFFICULTY_LABEL[c.level]} · {c.courseType === "PRO" ? "Pro" : "Free"}</span>
                  <span>{c.sectionCount ?? 0} sections</span>
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

      <CourseFormDialog open={createOpen} onOpenChange={setCreateOpen} onSave={handleCreate} />

      <DeleteConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
        title="Delete this course?"
        description={deleteError || "This action cannot be undone."}
        usageWarning={
          deleteTarget && (deleteTarget.sectionCount ?? 0) > 0
            ? `This course still has ${deleteTarget.sectionCount} section(s). You must delete all sections first before deleting the course.`
            : undefined
        }
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}