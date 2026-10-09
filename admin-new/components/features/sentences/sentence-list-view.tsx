"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MessageSquareOff, Trash2, Sparkles } from "lucide-react";
import { ContentPageHeader } from "@/components/shared/content-page-header";
import { ContentSearch } from "@/components/shared/content-search";
import { ContentStatusFilter } from "@/components/shared/content-filters";
import { ContentDataTable, type DataTableColumn } from "@/components/shared/content-data-table";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SentenceFormDialog } from "@/components/features/sentences/sentence-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SENTENCE_CATEGORIES } from "@/lib/sentences/categories";
import { createSentenceAction, deleteSentenceAction, generateSentenceAction, getSentenceAction, listSentencesAction } from "@/actions/content/sentence-actions";
import { buildSentenceCreatePayload } from "@/lib/sentences/api";
import type { ContentStatus, Sentence, SentenceFormValues } from "@/lib/types/content";
import { DIFFICULTY_LABEL } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";

const PAGE_LIMIT = 20;

export function SentenceListView({
    initialSentences,
    initialMeta,
}: {
    initialSentences: Sentence[];
    initialMeta: { page: number; limit: number; total: number; totalPages: number };
}) {
    const router = useRouter();
    const { role } = useRole();
    const [sentences, setSentences] = useState<Sentence[]>(initialSentences);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<Set<ContentStatus>>(new Set());
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(initialMeta.page);
    const [total, setTotal] = useState(initialMeta.total);
    const [totalPages, setTotalPages] = useState(initialMeta.totalPages);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState(0);
    const [createOpen, setCreateOpen] = useState(false);
    const [generateOpen, setGenerateOpen] = useState(false);
    const [generationQuery, setGenerationQuery] = useState("");
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [generationMessage, setGenerationMessage] = useState<string | null>(null);
    const [generationPendingId, setGenerationPendingId] = useState<string | null>(null);
    const [generationCheck, setGenerationCheck] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Sentence | null>(null);
    const firstListEffect = useRef(true);

    useEffect(() => {
        if (firstListEffect.current) {
            firstListEffect.current = false;
            return;
        }
        let active = true;

        listSentencesAction({
            page,
            limit: PAGE_LIMIT,
            search: search.trim() || undefined,
            status: statusFilter.values().next().value,
            category: category || undefined,
        })
            .then((result) => {
                if (!active) return;
                if (result.success) {
                    setSentences(result.data.items);
                    setTotal(result.data.meta.total);
                    setTotalPages(result.data.meta.totalPages);
                    if (page > result.data.meta.totalPages) setPage(result.data.meta.totalPages);
                } else {
                    setError(result.error);
                    setSentences([]);
                    setTotal(0);
                    setTotalPages(1);
                }
            })
            .catch(() => {
                if (!active) return;
                setError("Unable to load sentences. Please try again.");
                setSentences([]);
                setTotal(0);
                setTotalPages(1);
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
        };
    }, [page, search, statusFilter, category, refreshToken]);

    useEffect(() => {
        const sentenceId = generationPendingId;
        if (sentenceId === null) return;
        let active = true;
        let timer: ReturnType<typeof setTimeout>;
        let attempts = 0;

        async function checkGeneration(id: string) {
            try {
                const result = await getSentenceAction(id);
                if (!active) return;
                if (!result.success) {
                    setGenerationMessage(result.error);
                    return;
                }
                const sentence = result.data;
                if (sentence.meaningEnglish.trim() && sentence.meaningBangla.trim()) {
                    setGenerationMessage(`AI generation completed for ${sentence.sentenceKey}.`);
                    setGenerationPendingId(null);
                    setRefreshToken((value) => value + 1);
                    return;
                }
                attempts += 1;
                if (attempts >= 20) {
                    setGenerationMessage(`Generation is still processing for ${sentence.sentenceKey}. Check again shortly.`);
                    return;
                }
                timer = setTimeout(() => void checkGeneration(id), 3000);
            } catch (cause) {
                if (!active) return;
                setGenerationMessage(
                    `Could not confirm the generation status${cause instanceof Error ? `: ${cause.message}` : "."} The job may still be processing.`,
                );
            }
        }

        timer = setTimeout(() => void checkGeneration(sentenceId), 1500);
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [generationPendingId, generationCheck]);

    async function handleCreate(values: SentenceFormValues) {
        const result = await createSentenceAction(buildSentenceCreatePayload(values));
        if (!result.success) throw new Error(result.error);
        setIsLoading(true);
        setError(null);
        setPage(1);
        setRefreshToken((value) => value + 1);
    }

    async function handleGenerate() {
        if (isGenerating || !generationQuery.trim()) return;
        setIsGenerating(true);
        setGenerationError(null);
        try {
            const result = await generateSentenceAction(generationQuery.trim());
            if (!result.success) {
                setGenerationError(result.error);
                return;
            }
            const queued = result.data;
            if (queued.meaningEnglish.trim() && queued.meaningBangla.trim()) {
                setGenerationMessage(`Sentence ${queued.sentenceKey} is ready.`);
                setGenerationPendingId(null);
            } else {
                setGenerationPendingId(queued.id);
                setGenerationMessage(`AI generation queued for ${queued.sentenceKey}.`);
            }
            setGenerationQuery("");
            setGenerateOpen(false);
            setIsLoading(true);
            setError(null);
            setPage(1);
            setRefreshToken((value) => value + 1);
        } catch (cause) {
            setGenerationError(cause instanceof Error ? cause.message : "Unable to queue sentence generation.");
        } finally {
            setIsGenerating(false);
        }
    }

    async function handleDelete(sentence: Sentence) {
        try {
            const result = await deleteSentenceAction(sentence.id);
            if (!result.success) {
                setError(result.error);
                return;
            }
            setDeleteTarget(null);
            setIsLoading(true);
            setError(null);
            setRefreshToken((value) => value + 1);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Unable to delete sentence.");
        }
    }

    const columns: DataTableColumn<Sentence>[] = [
        {
            key: "arabic",
            header: "Arabic",
            cell: (sentence) => (
                <div>
                    <p dir="rtl" lang="ar" className="font-arabic text-lg leading-relaxed text-text">
                        {sentence.arabicText || "—"}
                    </p>
                    <p className="text-xs text-text-muted">{sentence.sentenceKey}</p>
                </div>
            ),
        },
        {
            key: "meaning",
            header: "Meaning",
            cell: (sentence) => (
                <div>
                    <p className="text-text">{sentence.meaningEnglish || "—"}</p>
                    <p className="font-bengali text-xs text-text-muted">
                        {sentence.meaningBangla || "—"}
                    </p>
                </div>
            ),
        },
        {
            key: "difficulty",
            header: "Difficulty",
            cell: (sentence) => (
                <Badge className="bg-neutral-bg text-neutral-text">
                    {DIFFICULTY_LABEL[sentence.difficulty]}
                </Badge>
            ),
        },
        {
            key: "usage",
            header: "Used in",
            cell: (sentence) => (
                <span className="text-xs text-text-muted">
                    {sentence.usedInLessons === undefined || sentence.usedInConversations === undefined
                        ? "Usage data unavailable"
                        : `${sentence.usedInLessons} Lessons · ${sentence.usedInConversations} Conversations`}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            cell: (sentence) => <ContentStatusBadge status={sentence.status} />,
        },
        {
            key: "actions",
            header: "",
            className: "text-right",
            cell: (sentence) => (
                <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
                    {role === "ADMIN" ? (
                        <Button variant="ghost" size="icon" aria-label={`Delete ${sentence.sentenceKey}`} onClick={() => setDeleteTarget(sentence)}>
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
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setGenerateOpen(true)}>
                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                            Generate with AI
                        </Button>
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Create sentence
                        </Button>
                    </div>
                }
            />

            {generationMessage ? (
                <div role="status" className="flex items-center justify-between gap-3 rounded-default border border-border bg-white p-3 text-sm text-text-secondary">
                    <span>{generationMessage}</span>
                    {generationPendingId ? (
                        <Button variant="secondary" size="sm" onClick={() => setGenerationCheck((value) => value + 1)}>
                            Check status
                        </Button>
                    ) : null}
                </div>
            ) : null}
            {generationError ? <p role="alert" className="text-sm text-error-text">{generationError}</p> : null}

            {error ? (
                <div role="alert" className="flex items-center justify-between gap-3 rounded-default border border-error/20 bg-error-bg p-3 text-sm text-error-text">
                    <span>{error}</span>
                    <Button variant="secondary" size="sm" onClick={() => {
                        setIsLoading(true);
                        setError(null);
                        setRefreshToken((value) => value + 1);
                    }}>
                        Retry
                    </Button>
                </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <ContentSearch
                        value={search}
                        onChange={(value) => {
                            setSearch(value);
                            setIsLoading(true);
                            setError(null);
                            setPage(1);
                            setRefreshToken((value) => value + 1);
                        }}
                        placeholder="Search Arabic, English, Bangla..."
                    />
                    <ContentStatusFilter
                        selected={statusFilter}
                        onChange={(value) => {
                            setStatusFilter(value);
                            setIsLoading(true);
                            setError(null);
                            setPage(1);
                        }}
                        options={["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"]}
                        singleSelection
                    />
                    <select
                        aria-label="Filter by category"
                        value={category}
                        onChange={(event) => {
                            setCategory(event.target.value);
                            setIsLoading(true);
                            setError(null);
                            setPage(1);
                        }}
                        className="h-9 rounded-default border border-border-strong bg-white px-3 text-sm text-text"
                    >
                        <option value="">All categories</option>
                        {SENTENCE_CATEGORIES.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </div>
                <p className="text-xs text-text-muted">
                    {total} {total === 1 ? "sentence" : "sentences"}
                </p>
            </div>

            {isLoading ? (
                <div role="status" className="text-sm text-text-muted">Loading sentences…</div>
            ) : !error && sentences.length === 0 ? (
                <EmptyState
                    icon={MessageSquareOff}
                    title={search || statusFilter.size || category ? "No matching sentences found" : "No sentences found"}
                    description="Try adjusting your search or filters, or create a new sentence to get started."
                    action={
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Create sentence
                        </Button>
                    }
                />
            ) : sentences.length > 0 ? (
                <ContentDataTable
                    columns={columns}
                    rows={sentences}
                    rowKey={(sentence) => sentence.id}
                    onRowClick={(sentence) => router.push(`/admin/sentences/${encodeURIComponent(sentence.id)}`)}
                    renderMobileCard={(sentence) => (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p dir="rtl" lang="ar" className="font-arabic text-xl text-text">
                                        {sentence.arabicText || "—"}
                                    </p>
                                    <p className="text-xs text-text-muted">{sentence.sentenceKey}</p>
                                </div>
                                <ContentStatusBadge status={sentence.status} />
                            </div>
                            <p className="text-sm text-text">{sentence.meaningEnglish || "—"}</p>
                            <div className="flex items-center justify-between text-xs text-text-muted">
                                <span>{DIFFICULTY_LABEL[sentence.difficulty]}</span>
                                <span>{sentence.category}</span>
                            </div>
                        </div>
                    )}
                />
            ) : null}

            {!isLoading && totalPages > 1 ? (
                <div className="flex items-center justify-between text-sm text-text-muted">
                    <span>Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => {
                            setIsLoading(true);
                            setError(null);
                            setPage((value) => value - 1);
                        }}>
                            Previous
                        </Button>
                        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => {
                            setIsLoading(true);
                            setError(null);
                            setPage((value) => value + 1);
                        }}>
                            Next
                        </Button>
                    </div>
                </div>
            ) : null}

            <SentenceFormDialog open={createOpen} onOpenChange={setCreateOpen} onSave={handleCreate} />

            <Dialog open={generateOpen} onOpenChange={(open) => !isGenerating && setGenerateOpen(open)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate sentence with AI</DialogTitle>
                        <DialogDescription>
                            Enter an Arabic sentence or a phrase to translate into Arabic. The sentence is created as a draft while the backend job runs.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <label htmlFor="sentence-ai-query" className="text-sm font-medium text-text">Prompt</label>
                        <textarea
                            id="sentence-ai-query"
                            value={generationQuery}
                            onChange={(event) => setGenerationQuery(event.target.value)}
                            maxLength={500}
                            rows={4}
                            className="w-full rounded-default border border-border-strong bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                            placeholder="Enter Arabic text or describe the sentence"
                        />
                        {generationError ? <p role="alert" className="text-sm text-error-text">{generationError}</p> : null}
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" disabled={isGenerating} onClick={() => setGenerateOpen(false)}>Cancel</Button>
                            <Button disabled={!generationQuery.trim() || isGenerating} onClick={() => void handleGenerate()}>
                                {isGenerating ? "Queueing…" : "Generate"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <DeleteConfirmationDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Delete this sentence?"
                description="This action cannot be undone. The underlying Arabic Entity is not affected."
                onConfirm={() => deleteTarget && void handleDelete(deleteTarget)}
            />
        </div>
    );
}
