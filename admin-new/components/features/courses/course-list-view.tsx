"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, Trash2 } from "lucide-react";
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
import { mockCourses } from "@/lib/mock-data/courses";
import { mockSections } from "@/lib/mock-data/sections";
import { mockLessons } from "@/lib/mock-data/lessons";
import type { Course, CourseFormValues, ContentStatus } from "@/lib/types/content";
import { DIFFICULTY_LABEL } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";

function courseCounts(courseId: string) {
    const sections = mockSections.filter((s) => s.courseId === courseId);
    const sectionIds = new Set(sections.map((s) => s.id));
    const lessons = mockLessons.filter((l) => sectionIds.has(l.sectionId));
    return { sections: sections.length, lessons: lessons.length };
}

export function CourseListView() {
    const router = useRouter();
    const { role } = useRole();

    const [courses, setCourses] = useState<Course[]>(mockCourses);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<Set<ContentStatus>>(new Set());
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

    const filtered = useMemo(() => {
        return courses.filter((c) => {
            const matchesStatus = statusFilter.size === 0 || statusFilter.has(c.status);
            const needle = search.trim().toLowerCase();
            const matchesSearch =
                !needle || c.title.toLowerCase().includes(needle) || c.courseKey.toLowerCase().includes(needle);
            return matchesStatus && matchesSearch;
        });
    }, [courses, search, statusFilter]);

    function handleCreate(values: CourseFormValues) {
        const newCourse: Course = {
            id: crypto.randomUUID(),
            courseKey: `CRS-${1000 + courses.length + 1}`,
            ...values,
            status: "DRAFT",
            createdBy: role === "ADMIN" ? "You (Admin)" : "You (Content Manager)",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setCourses((prev) => [newCourse, ...prev]);
        router.push(`/courses/${newCourse.id}`);
    }

    function handleDelete(course: Course) {
        setCourses((prev) => prev.filter((c) => c.id !== course.id));
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
            cell: (c) => {
                const counts = courseCounts(c.id);
                return (
                    <span className="text-xs text-[var(--color-text-muted)]">
                        {counts.sections} Section{counts.sections !== 1 ? "s" : ""} · {counts.lessons} Lesson
                        {counts.lessons !== 1 ? "s" : ""}
                    </span>
                );
            },
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
                        <Button variant="ghost" size="icon" aria-label={`Delete ${c.courseKey}`} onClick={() => setDeleteTarget(c)}>
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
                title="Courses"
                description="Organize Arabic Master's learning programs and curriculum."
                primaryAction={
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Create course
                    </Button>
                }
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <ContentSearch value={search} onChange={setSearch} placeholder="Search title or ID..." />
                    <ContentStatusFilter
                        selected={statusFilter}
                        onChange={setStatusFilter}
                        options={["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"]}
                    />
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                    {filtered.length} {filtered.length === 1 ? "course" : "courses"}
                </p>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="No courses yet"
                    description="Create your first course, then add sections and lessons to it."
                    action={
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Create course
                        </Button>
                    }
                />
            ) : (
                <ContentDataTable
                    columns={columns}
                    rows={filtered}
                    rowKey={(c) => c.id}
                    onRowClick={(c) => router.push(`/courses/${c.id}`)}
                    renderMobileCard={(c) => {
                        const counts = courseCounts(c.id);
                        return (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium text-[var(--color-text)]">{c.title}</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">{c.courseKey}</p>
                                    </div>
                                    <ContentStatusBadge status={c.status} />
                                </div>
                                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                                    <span>
                                        {DIFFICULTY_LABEL[c.level]} · {c.courseType === "PRO" ? "Pro" : "Free"}
                                    </span>
                                    <span>
                                        {counts.sections} sections · {counts.lessons} lessons
                                    </span>
                                </div>
                            </div>
                        );
                    }}
                />
            )}

            <CourseFormDialog open={createOpen} onOpenChange={setCreateOpen} onSave={handleCreate} />

            <DeleteConfirmationDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Delete this course?"
                description="This action cannot be undone."
                usageWarning={
                    deleteTarget && courseCounts(deleteTarget.id).sections > 0
                        ? `This course has ${courseCounts(deleteTarget.id).sections} section(s) and ${courseCounts(deleteTarget.id).lessons} lesson(s). Deleting it will orphan them. Consider archiving instead.`
                        : undefined
                }
                onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
            />
        </div>
    );
}