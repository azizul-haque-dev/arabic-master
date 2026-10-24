"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Pencil, XCircle, Layers, GraduationCap } from "lucide-react";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { ContentActionBar } from "@/components/shared/content-action-bar";
import { RejectionDialog } from "@/components/shared/rejection-dialog";
import { SectionFormDialog } from "@/components/features/sections/section-form-dialog";
import { Button } from "@/components/ui/button";
import {
  updateSectionAction,
  updateSectionStatusAction,
} from "@/actions/content/section-actions";
import type { ContentStatus, Section, SectionFormValues } from "@/lib/types/content";
import type { CourseOption } from "@/lib/sections/api";
import { useRole } from "@/lib/role-context";

export function SectionDetailView({
  initialSection,
  courseOptions = [],
}: {
  initialSection: Section;
  courseOptions?: CourseOption[];
}) {
  const router = useRouter();
  const { role } = useRole();
  const [section, setSection] = useState<Section>(initialSection);
  const [editOpen, setEditOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const courseTitle = useMemo(() => {
    if (section.course?.title) return section.course.title;
    if (section.courseTitle) return section.courseTitle;
    const found = courseOptions.find((c) => c.id === section.courseId);
    return found?.title ?? "Course";
  }, [section, courseOptions]);

  const lessons = useMemo(() => {
    return section.lessons ?? [];
  }, [section.lessons]);

  async function handleSetStatus(status: ContentStatus, rejectionReason?: string) {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    setActionError(null);
    try {
      const res = await updateSectionStatusAction(section.id, status, rejectionReason);
      if (res.success) {
        setSection(res.data);
        router.refresh();
      } else {
        setActionError(res.error);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to update status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleSave(values: SectionFormValues) {
    setActionError(null);
    const res = await updateSectionAction(section.id, {
      title: values.title,
      description: values.description,
    });
    if (!res.success) {
      throw new Error(res.error);
    }
    setSection(res.data);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <nav
        className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]"
        aria-label="Breadcrumb"
      >
        <Link href="/admin/courses" className="hover:text-[var(--color-text)]">
          Courses
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <Link
          href={`/admin/courses/${section.courseId}`}
          className="hover:text-[var(--color-text)]"
        >
          {courseTitle}
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="text-[var(--color-text-secondary)]">{section.sectionKey}</span>
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
            {section.title}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--color-text-secondary)]">
            {section.description || "No description provided."}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--color-text-muted)]">
              {section.sectionKey}
            </span>
            <ContentStatusBadge status={section.status} />
          </div>
        </div>
        <Button variant="secondary" onClick={() => setEditOpen(true)}>
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          Edit
        </Button>
      </div>

      {section.status === "REJECTED" && section.rejectionReason ? (
        <div className="flex gap-2.5 rounded-[var(--radius-default)] border border-[var(--color-error)]/20 bg-[var(--color-error-bg)] p-3.5 text-sm text-[var(--color-error-text)]">
          <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Reason for rejection</p>
            <p className="mt-0.5">{section.rejectionReason}</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-[var(--font-heading)] text-sm font-semibold text-[var(--color-text)]">
                Lessons
              </h2>
              <span className="text-xs text-[var(--color-text-muted)]">
                {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
              </span>
            </div>
            {lessons.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                No lessons in this section yet. Lessons will appear here once added to this section.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/admin/lessons/${lesson.id}`}
                      className="flex items-center justify-between rounded-[var(--radius-default)] border border-[var(--color-border)] px-3.5 py-2.5 transition-colors hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary-light)]/10"
                    >
                      <div>
                        <p className="font-medium text-[var(--color-text)]">
                          {lesson.title}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {lesson.lessonKey} · {lesson.itemCount} item(s)
                        </p>
                      </div>
                      <ContentStatusBadge status={lesson.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
            <h2 className="font-[var(--font-heading)] text-sm font-semibold text-[var(--color-text)]">
              Review & publishing
            </h2>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Signed in as {role === "ADMIN" ? "Admin" : "Content Manager"} — actions below reflect your role.
            </p>
            <div className="mt-4">
              <ContentActionBar
                role={role}
                status={section.status}
                onSaveDraft={
                  section.status === "DRAFT"
                    ? () => handleSetStatus("DRAFT")
                    : undefined
                }
                onSubmitForReview={() => handleSetStatus("IN_REVIEW")}
                onApprove={() => handleSetStatus("APPROVED")}
                onReject={() => setRejectOpen(true)}
                onPublish={() => handleSetStatus("PUBLISHED")}
              />
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 text-xs text-[var(--color-text-muted)]">
            <h2 className="font-[var(--font-heading)] text-sm font-semibold text-[var(--color-text)]">
              Metadata
            </h2>
            <dl className="mt-3 flex flex-col gap-2">
              <div className="flex justify-between">
                <dt>Order</dt>
                <dd className="font-medium text-[var(--color-text-secondary)]">
                  #{section.order}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Course</dt>
                <dd className="font-medium text-[var(--color-text-secondary)]">
                  {courseTitle}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Created by</dt>
                <dd className="text-[var(--color-text-secondary)]">
                  {section.createdBy}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Last updated</dt>
                <dd className="text-[var(--color-text-secondary)]">
                  {new Date(section.updatedAt).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Created at</dt>
                <dd className="text-[var(--color-text-secondary)]">
                  {new Date(section.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <SectionFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initialSection={section}
        courseOptions={courseOptions}
        onSave={handleSave}
      />

      <RejectionDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onSubmit={(reason) => handleSetStatus("REJECTED", reason)}
      />
    </div>
  );
}