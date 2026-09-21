"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Layers, Trash2 } from "lucide-react";
import { ContentPageHeader } from "@/components/shared/content-page-header";
import { ContentSearch } from "@/components/shared/content-search";
import { ContentStatusFilter } from "@/components/shared/content-filters";
import { ContentDataTable, type DataTableColumn } from "@/components/shared/content-data-table";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { SectionFormDialog } from "@/components/features/sections/section-form-dialog";
import { Button } from "@/components/ui/button";
import { mockSections } from "@/lib/mock-data/sections";
import { mockCourses } from "@/lib/mock-data/courses";
import { mockLessons } from "@/lib/mock-data/lessons";
import type { Section, SectionFormValues, ContentStatus } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";

function courseTitle(courseId: string) {
    return mockCourses.find((c) => c.id === courseId)?.title ?? "Unknown course";
}

function lessonCount(sectionId: string) {
    return mockLessons.filter((l) => l.sectionId === sectionId).length;
}

export function SectionListView() {
    const router = useRouter();
    const { role } = useRole();

    const [sections, setSections] = useState<Section[]>(mockSections);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<Set<ContentStatus>>(new Set());
    const [courseFilter, setCourseFilter] = useState<string>("");
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);

    const filtered = useMemo(() => {
        return sections.filter((s) => {
            const matchesStatus = statusFilter.size === 0 || statusFilter.has(s.status);
            const matchesCourse = !courseFilter || s.courseId === courseFilter;
            const needle = search.trim().toLowerCase();
            const matchesSearch =
                !needle || s.title.toLowerCase().includes(needle) || s.sectionKey.toLowerCase().includes(needle);
            return matchesStatus && matchesCourse && matchesSearch;
        });
    }, [sections, search, statusFilter, courseFilter]);

    function handleCreate(values: SectionFormValues) {
        const newSection: Section = {
            id: crypto.randomUUID(),
            sectionKey: `SEC-${2000 + sections.length + 1}`,
            title: values.title,
            description: values.description,
            courseId: values.courseId,
            order: sections.filter((s) => s.courseId === values.courseId).length + 1,
            status: "DRAFT",
            createdBy: role === "ADMIN" ? "You (Admin)" : "You (Content Manager)",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setSections((prev) => [newSection, ...prev]);
        router.push(`/sections/${newSection.id}`);
    }

    function handleDelete(section: Section) {
        setSections((prev) => prev.filter((s) => s.id !== section.id));
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
            cell: (s) => <span className="text-[var(--color-text-secondary)]">{courseTitle(s.courseId)}</span>,
        },
        {
            key: "order",
            header: "Order",
            cell: (s) => <span className="text-xs text-[var(--color-text-muted)]">#{s.order}</span>,
        },
        {
            key: "lessons",
            header: "Lessons",
            cell: (s) => <span className="text-xs text-[var(--color-text-muted)]">{lessonCount(s.id)}</span>,
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
                        <Button variant="ghost" size="icon" aria-label={`Delete ${s.sectionKey}`} onClick={() => setDeleteTarget(s)}>
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
                title="Sections"
                description="Groups of lessons within a course."
                primaryAction={
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Create section
                    </Button>
                }
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <ContentSearch value={search} onChange={setSearch} placeholder="Search title or ID..." />
                    <select
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        className="h-11 rounded-[var(--radius-default)] border border-[var(--color-border-strong)] bg-white px-3 text-sm focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/10"
                    >
                        <option value="">All courses</option>
                        {mockCourses.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.title}
                            </option>
                        ))}
                    </select>
                    <ContentStatusFilter
                        selected={statusFilter}
                        onChange={setStatusFilter}
                        options={["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"]}
                    />
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                    {filtered.length} {filtered.length === 1 ? "section" : "sections"}
                </p>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={Layers}
                    title="No sections found"
                    description="Try adjusting your filters, or create a new section."
                    action={
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Create section
                        </Button>
                    }
                />
            ) : (
                <ContentDataTable
                    columns={columns}
                    rows={filtered}
                    rowKey={(s) => s.id}
                    onRowClick={(s) => router.push(`/sections/${s.id}`)}
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
                                <span>{courseTitle(s.courseId)}</span>
                                <span>{lessonCount(s.id)} lessons</span>
                            </div>
                        </div>
                    )}
                />
            )}

            <SectionFormDialog open={createOpen} onOpenChange={setCreateOpen} onSave={handleCreate} />

            <DeleteConfirmationDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Delete this section?"
                description="This action cannot be undone."
                usageWarning={
                    deleteTarget && lessonCount(deleteTarget.id) > 0
                        ? `This section has ${lessonCount(deleteTarget.id)} lesson(s). Deleting it will orphan them. Consider archiving instead.`
                        : undefined
                }
                onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
            />
        </div>
    );
}