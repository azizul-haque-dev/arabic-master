"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Pencil, XCircle } from "lucide-react";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { ContentActionBar } from "@/components/shared/content-action-bar";
import { RejectionDialog } from "@/components/shared/rejection-dialog";
import { SectionFormDialog } from "@/components/features/sections/section-form-dialog";
import { Button } from "@/components/ui/button";
import { mockCourses } from "@/lib/mock-data/courses";
import { mockLessons } from "@/lib/mock-data/lessons";
import type { ContentStatus, Section, SectionFormValues } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";

export function SectionDetailView({ initialSection }: { initialSection: Section }) {
    const { role } = useRole();
    const [section, setSection] = useState(initialSection);
    const [editOpen, setEditOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);

    const course = mockCourses.find((c) => c.id === section.courseId);
    const lessons = mockLessons.filter((l) => l.sectionId === section.id);

    function setStatus(status: ContentStatus, rejectionReason?: string) {
        setSection((prev) => ({ ...prev, status, rejectionReason, updatedAt: new Date().toISOString() }));
    }

    function handleSave(values: SectionFormValues) {
        setSection((prev) => ({ ...prev, ...values, updatedAt: new Date().toISOString() }));
    }

    return (
        <div className="flex flex-col gap-6">
            <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]" aria-label="Breadcrumb">
                <Link href="/courses" className="hover:text-[var(--color-text)]">
                    Courses
                </Link>
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                {course ? (
                    <Link href={`/courses/${course.id}`} className="hover:text-[var(--color-text)]">
                        {course.title}
                    </Link>
                ) : (
                    <span>Unknown course</span>
                )}
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                <span className="text-[var(--color-text-secondary)]">{section.sectionKey}</span>
            </nav>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-text)]">{section.title}</h1>
                    <p className="mt-1 max-w-xl text-sm text-[var(--color-text-secondary)]">{section.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-[var(--color-text-muted)]">{section.sectionKey}</span>
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
                        <h2 className="font-[var(--font-heading)] text-sm font-semibold text-[var(--color-text)]">Lessons</h2>
                        {lessons.length === 0 ? (
                            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                                No lessons in this section yet. Create one from the Lessons screen.
                            </p>
                        ) : (
                            <ul className="mt-3 flex flex-col gap-2">
                                {lessons.map((lesson) => (
                                    <li key={lesson.id}>
                                        <Link
                                            href={`/lessons/${lesson.id}`}
                                            className="flex items-center justify-between rounded-[var(--radius-default)] border border-[var(--color-border)] px-3.5 py-2.5 transition-colors hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary-light)]/10"
                                        >
                                            <div>
                                                <p className="font-medium text-[var(--color-text)]">{lesson.title}</p>
                                                <p className="text-xs text-[var(--color-text-muted)]">{lesson.lessonKey}</p>
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
                                onSaveDraft={section.status === "DRAFT" ? () => setStatus("DRAFT") : undefined}
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
                                <dt>Order</dt>
                                <dd className="text-[var(--color-text-secondary)]">#{section.order}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Created by</dt>
                                <dd className="text-[var(--color-text-secondary)]">{section.createdBy}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Last updated</dt>
                                <dd className="text-[var(--color-text-secondary)]">
                                    {new Date(section.updatedAt).toLocaleDateString()}
                                </dd>
                            </div>
                        </dl>
                    </section>
                </div>
            </div>

            <SectionFormDialog open={editOpen} onOpenChange={setEditOpen} initialSection={section} onSave={handleSave} />

            <RejectionDialog
                open={rejectOpen}
                onOpenChange={setRejectOpen}
                onSubmit={(reason) => setStatus("REJECTED", reason)}
            />
        </div>
    );
}