"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, GraduationCap, Trash2 } from "lucide-react";
import { ContentPageHeader } from "@/components/shared/content-page-header";
import { ContentSearch } from "@/components/shared/content-search";
import { ContentStatusFilter } from "@/components/shared/content-filters";
import { ContentDataTable, type DataTableColumn } from "@/components/shared/content-data-table";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { LessonMetaDialog } from "@/components/features/lessons/lesson-meta-dialog";
import { Button } from "@/components/ui/button";
import { mockLessons } from "@/lib/mock-data/lessons";
import { mockSections } from "@/lib/mock-data/sections";
import { mockCourses } from "@/lib/mock-data/courses";
import type { Lesson, LessonMetaFormValues, ContentStatus } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";

function sectionOf(lesson: Lesson) {
    return mockSections.find((s) => s.id === lesson.sectionId);
}

function courseOf(lesson: Lesson) {
    const section = sectionOf(lesson);
    return section ? mockCourses.find((c) => c.id === section.courseId) : undefined;
}

function countByType(lesson: Lesson) {
    const words = lesson.items.filter((i) => i.contentType === "WORD").length;
    const sentences = lesson.items.filter((i) => i.contentType === "SENTENCE").length;
    const conversations = lesson.items.filter((i) => i.contentType === "CONVERSATION").length;
    return { words, sentences, conversations };
}

export function LessonListView() {
    const router = useRouter();
    const { role } = useRole();

    const [lessons, setLessons] = useState<Lesson[]>(mockLessons);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<Set<ContentStatus>>(new Set());
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);

    const filtered = useMemo(() => {
        return lessons.filter((l) => {
            const matchesStatus = statusFilter.size === 0 || statusFilter.has(l.status);
            const needle = search.trim().toLowerCase();
            const section = sectionOf(l);
            const course = courseOf(l);
            const matchesSearch =
                !needle ||
                l.title.toLowerCase().includes(needle) ||
                (course?.title.toLowerCase().includes(needle) ?? false) ||
                (section?.title.toLowerCase().includes(needle) ?? false) ||
                l.lessonKey.toLowerCase().includes(needle);
            return matchesStatus && matchesSearch;
        });
    }, [lessons, search, statusFilter]);

    function handleCreate(values: LessonMetaFormValues) {
        const newLesson: Lesson = {
            id: crypto.randomUUID(),
            lessonKey: `LSN-${4000 + lessons.length + 1}`,
            ...values,
            items: [],
            status: "DRAFT",
            createdBy: role === "ADMIN" ? "You (Admin)" : "You (Content Manager)",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setLessons((prev) => [newLesson, ...prev]);
        router.push(`/lessons/${newLesson.id}`);
    }

    function handleDelete(lesson: Lesson) {
        setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
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
            key: "placement",
            header: "Course · Section",
            cell: (l) => (
                <span className="text-[var(--color-text-secondary)]">
                    {courseOf(l)?.title ?? "—"} · {sectionOf(l)?.title ?? "—"}
                </span>
            ),
        },
        {
            key: "content",
            header: "Content",
            cell: (l) => {
                const c = countByType(l);
                return (
                    <span className="text-xs text-[var(--color-text-muted)]">
                        {c.words}W · {c.sentences}S · {c.conversations}C
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
                        <Button variant="ghost" size="icon" aria-label={`Delete ${l.lessonKey}`} onClick={() => setDeleteTarget(l)}>
                            <Trash2 className="h-4 w-4 text-[var(--color-text-muted)]" />
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
                description="Small, repeatable learning units made of words, sentences, and conversations."
                primaryAction={
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Create lesson
                    </Button>
                }
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <ContentSearch value={search} onChange={setSearch} placeholder="Search title, course, section, or ID..." />
                    <ContentStatusFilter
                        selected={statusFilter}
                        onChange={setStatusFilter}
                        options={["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"]}
                    />
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                    {filtered.length} {filtered.length === 1 ? "lesson" : "lessons"}
                </p>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={GraduationCap}
                    title="No lessons yet"
                    description="Create your first lesson, then add words, sentences, and conversations to it."
                    action={
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Create lesson
                        </Button>
                    }
                />
            ) : (
                <ContentDataTable
                    columns={columns}
                    rows={filtered}
                    rowKey={(l) => l.id}
                    onRowClick={(l) => router.push(`/lessons/${l.id}`)}
                    renderMobileCard={(l) => {
                        const c = countByType(l);
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
                                        {courseOf(l)?.title ?? "—"} · {sectionOf(l)?.title ?? "—"}
                                    </span>
                                    <span>
                                        {c.words}W · {c.sentences}S · {c.conversations}C
                                    </span>
                                </div>
                            </div>
                        );
                    }}
                />
            )}

            <LessonMetaDialog open={createOpen} onOpenChange={setCreateOpen} onSave={handleCreate} />

            <DeleteConfirmationDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Delete this lesson?"
                description="This action cannot be undone. Words, sentences, and conversations referenced by this lesson are not affected."
                onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
            />
        </div>
    );
}