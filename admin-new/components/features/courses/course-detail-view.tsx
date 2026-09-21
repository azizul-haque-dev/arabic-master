"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Pencil, Plus, XCircle, ChevronUp, ChevronDown } from "lucide-react";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { ContentActionBar } from "@/components/shared/content-action-bar";
import { RejectionDialog } from "@/components/shared/rejection-dialog";
import { CourseFormDialog } from "@/components/features/courses/course-form-dialog";
import { SectionFormDialog } from "@/components/features/sections/section-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockSections as initialMockSections } from "@/lib/mock-data/sections";
import { mockLessons } from "@/lib/mock-data/lessons";
import type { Course, CourseFormValues, ContentStatus, Section, SectionFormValues } from "@/lib/types/content";
import { DIFFICULTY_LABEL } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";

export function CourseDetailView({ initialCourse }: { initialCourse: Course }) {
    const { role } = useRole();
    const [course, setCourse] = useState(initialCourse);
    const [sections, setSections] = useState<Section[]>(
        initialMockSections.filter((s) => s.courseId === initialCourse.id).sort((a, b) => a.order - b.order),
    );
    const [editOpen, setEditOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [addSectionOpen, setAddSectionOpen] = useState(false);

    function setStatus(status: ContentStatus, rejectionReason?: string) {
        setCourse((prev) => ({ ...prev, status, rejectionReason, updatedAt: new Date().toISOString() }));
    }

    function handleEditSave(values: CourseFormValues) {
        setCourse((prev) => ({ ...prev, ...values, updatedAt: new Date().toISOString() }));
    }

    function handleAddSection(values: SectionFormValues) {
        const newSection: Section = {
            id: crypto.randomUUID(),
            sectionKey: `SEC-${2000 + sections.length + 1}`,
            title: values.title,
            description: values.description,
            courseId: course.id,
            order: sections.length + 1,
            status: "DRAFT",
            createdBy: role === "ADMIN" ? "You (Admin)" : "You (Content Manager)",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setSections((prev) => [...prev, newSection]);
    }

    function moveSection(index: number, direction: -1 | 1) {
        const target = index + direction;
        if (target < 0 || target >= sections.length) return;
        const next = [...sections];
        [next[index], next[target]] = [next[target], next[index]];
        setSections(next.map((s, i) => ({ ...s, order: i + 1 })));
    }

    function lessonCount(sectionId: string) {
        return mockLessons.filter((l) => l.sectionId === sectionId).length;
    }

    return (
        <div className="flex flex-col gap-6">
            <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]" aria-label="Breadcrumb">
                <Link href="/courses" className="hover:text-[var(--color-text)]">
                    Courses
                </Link>
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                <span className="text-[var(--color-text-secondary)]">{course.courseKey}</span>
            </nav>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-text)]">{course.title}</h1>
                    <p className="mt-1 max-w-xl text-sm text-[var(--color-text-secondary)]">{course.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-[var(--color-text-muted)]">{course.courseKey}</span>
                        <ContentStatusBadge status={course.status} />
                        <Badge className="bg-[var(--color-neutral-bg)] text-[var(--color-neutral-text)]">
                            {DIFFICULTY_LABEL[course.level]}
                        </Badge>
                        <Badge
                            className={
                                course.courseType === "PRO"
                                    ? "bg-[var(--color-accent-light)] text-[var(--color-accent)]"
                                    : "bg-[var(--color-success-bg)] text-[var(--color-success-text)]"
                            }
                        >
                            {course.courseType === "PRO" ? "Pro" : "Free"}
                        </Badge>
                    </div>
                </div>
                <Button variant="secondary" onClick={() => setEditOpen(true)}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                </Button>
            </div>

            {course.status === "REJECTED" && course.rejectionReason ? (
                <div className="flex gap-2.5 rounded-[var(--radius-default)] border border-[var(--color-error)]/20 bg-[var(--color-error-bg)] p-3.5 text-sm text-[var(--color-error-text)]">
                    <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <div>
                        <p className="font-medium">Reason for rejection</p>
                        <p className="mt-0.5">{course.rejectionReason}</p>
                    </div>
                </div>
            ) : null}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="flex flex-col gap-6 lg:col-span-2">
                    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="font-[var(--font-heading)] text-sm font-semibold text-[var(--color-text)]">Sections</h2>
                            <Button variant="secondary" size="sm" onClick={() => setAddSectionOpen(true)}>
                                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                Add section
                            </Button>
                        </div>

                        {sections.length === 0 ? (
                            <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                                No sections yet. Add one to start organizing lessons.
                            </p>
                        ) : (
                            <ol className="mt-4 flex flex-col gap-2">
                                {sections.map((section, index) => (
                                    <li
                                        key={section.id}
                                        className="flex items-center gap-3 rounded-[var(--radius-default)] border border-[var(--color-border)] p-3"
                                    >
                                        <span className="w-5 flex-shrink-0 text-center text-xs font-semibold text-[var(--color-text-muted)]">
                                            {section.order}
                                        </span>
                                        <Link href={`/sections/${section.id}`} className="flex-1 hover:underline">
                                            <p className="font-medium text-[var(--color-text)]">{section.title}</p>
                                            <p className="text-xs text-[var(--color-text-muted)]">
                                                {lessonCount(section.id)} lesson{lessonCount(section.id) !== 1 ? "s" : ""}
                                            </p>
                                        </Link>
                                        <ContentStatusBadge status={section.status} />
                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() => moveSection(index, -1)}
                                                disabled={index === 0}
                                                aria-label="Move up"
                                                className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-neutral-bg)] disabled:opacity-30"
                                            >
                                                <ChevronUp className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveSection(index, 1)}
                                                disabled={index === sections.length - 1}
                                                aria-label="Move down"
                                                className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-neutral-bg)] disabled:opacity-30"
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ol>
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
                                status={course.status}
                                onSaveDraft={course.status === "DRAFT" ? () => setStatus("DRAFT") : undefined}
                                onSubmitForReview={() => setStatus("IN_REVIEW")}
                                onApprove={() => setStatus("APPROVED")}
                                onReject={() => setRejectOpen(true)}
                                onPublish={() => setStatus("PUBLISHED")}
                            />
                        </div>
                    </section>
                </div>

                <div className="flex flex-col gap-6">
                    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 text-xs text-[var(--color-text-muted)]">
                        <h2 className="font-[var(--font-heading)] text-sm font-semibold text-[var(--color-text)]">Metadata</h2>
                        <dl className="mt-3 flex flex-col gap-2">
                            <div className="flex justify-between">
                                <dt>Created by</dt>
                                <dd className="text-[var(--color-text-secondary)]">{course.createdBy}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Last updated</dt>
                                <dd className="text-[var(--color-text-secondary)]">
                                    {new Date(course.updatedAt).toLocaleDateString()}
                                </dd>
                            </div>
                        </dl>
                    </section>
                </div>
            </div>

            <CourseFormDialog open={editOpen} onOpenChange={setEditOpen} initialCourse={course} onSave={handleEditSave} />

            <SectionFormDialog
                open={addSectionOpen}
                onOpenChange={setAddSectionOpen}
                fixedCourseId={course.id}
                onSave={handleAddSection}
            />

            <RejectionDialog
                open={rejectOpen}
                onOpenChange={setRejectOpen}
                onSubmit={(reason) => setStatus("REJECTED", reason)}
            />
        </div>
    );
}