"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageSquareOff, Trash2 } from "lucide-react";
import { ContentPageHeader } from "@/components/shared/content-page-header";
import { ContentSearch } from "@/components/shared/content-search";
import { ContentStatusFilter } from "@/components/shared/content-filters";
import { ContentDataTable, type DataTableColumn } from "@/components/shared/content-data-table";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { SentenceFormDialog } from "@/components/features/sentences/sentence-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockSentences } from "@/lib/mock-data/sentences";
import type { ArabicEntity, ContentStatus, Sentence, SentenceFormValues } from "@/lib/types/content";
import { DIFFICULTY_LABEL } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";

export function SentenceListView() {
    const router = useRouter();
    const { role } = useRole();

    const [sentences, setSentences] = useState<Sentence[]>(mockSentences);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<Set<ContentStatus>>(new Set());
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Sentence | null>(null);

    const filtered = useMemo(() => {
        return sentences.filter((s) => {
            const matchesStatus = statusFilter.size === 0 || statusFilter.has(s.status);
            const needle = search.trim().toLowerCase();
            const matchesSearch =
                !needle ||
                s.arabicText.includes(search.trim()) ||
                s.meaningEnglish.toLowerCase().includes(needle) ||
                s.meaningBangla.includes(search.trim()) ||
                s.sentenceKey.toLowerCase().includes(needle) ||
                s.category.toLowerCase().includes(needle);
            return matchesStatus && matchesSearch;
        });
    }, [sentences, search, statusFilter]);

    function handleCreate(entity: ArabicEntity, values: SentenceFormValues) {
        const newSentence: Sentence = {
            id: crypto.randomUUID(),
            sentenceKey: `SNT-${1000 + sentences.length + 1}`,
            entityId: entity.id,
            arabicText: entity.arabicText,
            ...values,
            usedInLessons: 0,
            usedInConversations: 0,
            status: "DRAFT",
            createdBy: role === "ADMIN" ? "You (Admin)" : "You (Content Manager)",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setSentences((prev) => [newSentence, ...prev]);
    }

    function handleDelete(sentence: Sentence) {
        setSentences((prev) => prev.filter((s) => s.id !== sentence.id));
    }

    const columns: DataTableColumn<Sentence>[] = [
        {
            key: "arabic",
            header: "Arabic",
            cell: (s) => (
                <div>
                    <p dir="rtl" lang="ar" className="font-arabic text-lg leading-relaxed text-text">
                        {s.arabicText}
                    </p>
                    <p className="text-xs text-text-muted">{s.sentenceKey}</p>
                </div>
            ),
        },
        {
            key: "meaning",
            header: "Meaning",
            cell: (s) => (
                <div>
                    <p className="text-text">{s.meaningEnglish}</p>
                    <p className="font-bengali text-xs text-text-muted">
                        {s.meaningBangla}
                    </p>
                </div>
            ),
        },
        {
            key: "difficulty",
            header: "Difficulty",
            cell: (s) => (
                <Badge className="bg-neutral-bg text-neutral-text">
                    {DIFFICULTY_LABEL[s.difficulty]}
                </Badge>
            ),
        },
        {
            key: "usage",
            header: "Used in",
            cell: (s) => (
                <span className="text-xs text-text-muted">
                    {s.usedInLessons} Lesson{s.usedInLessons !== 1 ? "s" : ""} · {s.usedInConversations} Conversation
                    {s.usedInConversations !== 1 ? "s" : ""}
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
                        <Button variant="ghost" size="icon" aria-label={`Delete ${s.sentenceKey}`} onClick={() => setDeleteTarget(s)}>
                            <Trash2 className="h-4 w-4 text-text-muted" />
                        </Button>
                    ) : null}
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <ContentPageHeader
                title="Sentences"
                description="Practical spoken sentences. Conversations are built from these — never directly from Arabic Entities."
                primaryAction={
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Create sentence
                    </Button>
                }
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <ContentSearch value={search} onChange={setSearch} placeholder="Search Arabic, English, Bangla, category..." />
                    <ContentStatusFilter
                        selected={statusFilter}
                        onChange={setStatusFilter}
                        options={["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"]}
                    />
                </div>
                <p className="text-xs text-text-muted">
                    {filtered.length} {filtered.length === 1 ? "sentence" : "sentences"}
                </p>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={MessageSquareOff}
                    title="No matching sentences found"
                    description="Try adjusting your search or filters, or create a new sentence to get started."
                    action={
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Create sentence
                        </Button>
                    }
                />
            ) : (
                <ContentDataTable
                    columns={columns}
                    rows={filtered}
                    rowKey={(s) => s.id}
                    onRowClick={(s) => router.push(`/sentences/${s.id}`)}
                    renderMobileCard={(s) => (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p dir="rtl" lang="ar" className="font-arabic text-xl text-text">
                                        {s.arabicText}
                                    </p>
                                    <p className="text-xs text-text-muted">{s.sentenceKey}</p>
                                </div>
                                <ContentStatusBadge status={s.status} />
                            </div>
                            <p className="text-sm text-text">{s.meaningEnglish}</p>
                            <div className="flex items-center justify-between text-xs text-text-muted">
                                <span>{DIFFICULTY_LABEL[s.difficulty]}</span>
                                <span>
                                    {s.usedInLessons}L · {s.usedInConversations}C
                                </span>
                            </div>
                        </div>
                    )}
                />
            )}

            <SentenceFormDialog open={createOpen} onOpenChange={setCreateOpen} onSave={handleCreate} />

            <DeleteConfirmationDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Delete this sentence?"
                description="This action cannot be undone. The underlying Arabic Entity is not affected."
                usageWarning={
                    deleteTarget && deleteTarget.usedInConversations > 0
                        ? `This sentence is used in ${deleteTarget.usedInConversations} conversation(s). Deleting it will break those conversations. Consider archiving instead.`
                        : undefined
                }
                onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
            />
        </div>
    );
}