"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, MessageSquareOff, Trash2, Sparkles } from "lucide-react";
import { ContentPageHeader } from "@/components/shared/content-page-header";
import { ContentDataTable, type DataTableColumn } from "@/components/shared/content-data-table";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { SentenceFormDialog } from "@/components/features/sentences/sentence-form-dialog";
import { SentenceAiDialog } from "@/components/features/sentences/sentence-ai-dialog";
import { SentenceFilterBar } from "@/components/features/sentences/sentence-filter-bar";
import { SentenceTypeBadge } from "@/components/features/sentences/sentence-type-badge";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    createSentenceAction,
    deleteSentenceAction,
    getSentenceAction,
    listSentencesAction,
    type SentenceBatchResult,
} from "@/actions/content/sentence-actions";
import { buildSentenceCreatePayload } from "@/lib/sentences/api";
import {
    DIFFICULTY_LABEL,
    type ContentStatus,
    type Sentence,
    type SentenceFormValues,
    type SentenceType,
} from "@/lib/types/content";
import { useRole } from "@/lib/role-context";
import { SENTENCE_CATEGORIES } from "@/lib/sentences/categories";

const PAGE_LIMIT = 20;
const CONTENT_STATUSES: ContentStatus[] = ["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"];

function replaceSentenceListUrl(
    updates: Partial<Record<"page" | "search" | "status" | "category" | "sentenceType", string | undefined>>,
    resetPage = true,
) {
    const params = new URLSearchParams(window.location.search);
    if (resetPage) params.delete("page");
    for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
    }
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    if (nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
        window.history.replaceState(null, "", nextUrl);
    }
}

export function SentenceListView({
    initialSentences,
    initialMeta,
    fixedSentenceType,
}: {
    initialSentences: Sentence[];
    initialMeta: { page: number; limit: number; total: number; totalPages: number };
    fixedSentenceType?: SentenceType;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { role } = useRole();
    const isShortOnly = fixedSentenceType === "SHORT";
    const [sentences, setSentences] = useState<Sentence[]>(initialSentences);
    const rawPageValue = searchParams.get("page");
    const rawPage = Number(rawPageValue);
    const page = Number.isSafeInteger(rawPage) && rawPage > 0 && rawPage <= 1_000_000 ? rawPage : 1;
    const search = searchParams.get("search") ?? "";
    const status = CONTENT_STATUSES.find((candidate) => candidate === searchParams.get("status"));
    const statusFilter = new Set<ContentStatus>(status ? [status] : []);
    const category = SENTENCE_CATEGORIES.find(
        (candidate) => candidate === searchParams.get("category"),
    ) ?? "";
    const sentenceTypeParam = searchParams.get("sentenceType");
    const sentenceTypeFilter: SentenceType | "" = fixedSentenceType
        ?? (sentenceTypeParam === "SHORT" || sentenceTypeParam === "LONG" ? sentenceTypeParam : "");
    const effectiveSentenceType = fixedSentenceType ?? (sentenceTypeFilter || undefined);
    const searchParamsString = searchParams.toString();
    const [total, setTotal] = useState(initialMeta.total);
    const [totalPages, setTotalPages] = useState(initialMeta.totalPages);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState(0);
    const [createOpen, setCreateOpen] = useState(false);
    const [generateOpen, setGenerateOpen] = useState(false);
    const [generationMessage, setGenerationMessage] = useState<string | null>(null);
    const [generationPendingId, setGenerationPendingId] = useState<string | null>(null);
    const [generationCheck, setGenerationCheck] = useState(0);
    const [deleteTarget, setDeleteTarget] = useState<Sentence | null>(null);
    const firstListEffect = useRef(true);

    useEffect(() => {
        if (firstListEffect.current) {
            firstListEffect.current = false;
            if (rawPageValue !== null && String(page) !== rawPageValue) {
                replaceSentenceListUrl({
                    page: page > 1 ? String(page) : undefined,
                }, false);
            }
            return;
        }
        let active = true;

        listSentencesAction({
            page,
            limit: PAGE_LIMIT,
            search: search.trim() || undefined,
            status,
            category: category || undefined,
            sentenceType: effectiveSentenceType,
        })
            .then((result) => {
                if (!active) return;
                if (result.success) {
                    setSentences(result.data.items);
                    setTotal(result.data.meta.total);
                    setTotalPages(result.data.meta.totalPages);
                    if (page > Math.max(1, result.data.meta.totalPages)) {
                        replaceSentenceListUrl({
                            page: result.data.meta.totalPages > 1
                                ? String(result.data.meta.totalPages)
                                : undefined,
                        }, false);
                    }
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
    }, [
        page,
        rawPageValue,
        search,
        status,
        category,
        effectiveSentenceType,
        searchParamsString,
        refreshToken,
    ]);

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
                    setGenerationMessage(
                        `Generation is still processing for ${sentence.sentenceKey}. Check again shortly.`,
                    );
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

    function triggerReload(resetPage = true) {
        setIsLoading(true);
        setError(null);
        if (resetPage && page > 1) {
            replaceSentenceListUrl({ page: undefined }, false);
        } else {
            setRefreshToken((value) => value + 1);
        }
    }

    async function handleCreate(values: SentenceFormValues) {
        const result = await createSentenceAction(buildSentenceCreatePayload(values));
        if (!result.success) throw new Error(result.error);
        triggerReload(true);
    }

    function handleGenerated(queued: Sentence) {
        if (queued.meaningEnglish.trim() && queued.meaningBangla.trim()) {
            setGenerationMessage(`Sentence ${queued.sentenceKey} is ready.`);
            setGenerationPendingId(null);
        } else {
            setGenerationPendingId(queued.id);
            setGenerationMessage(`AI generation queued for ${queued.sentenceKey}.`);
        }
        triggerReload(true);
    }

    function handleBatchGenerated(results: SentenceBatchResult[]) {
        const queuedCount = results.filter((r) => r.queued).length;
        const failedCount = results.filter((r) => !r.success).length;

        if (failedCount > 0) {
            setGenerationMessage(
                `Batch submitted: ${results.length - failedCount} succeeded (${queuedCount} queued in background), ${failedCount} failed.`,
            );
        } else {
            setGenerationMessage(
                `Batch submitted: ${results.length} sentences queued for background AI processing.`,
            );
        }
        triggerReload(true);
    }

    async function handleDelete(sentence: Sentence) {
        try {
            const result = await deleteSentenceAction(sentence.id);
            if (!result.success) {
                setError(result.error);
                return;
            }
            setDeleteTarget(null);
            triggerReload(false);
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
            key: "type",
            header: "Type",
            cell: (sentence) => <SentenceTypeBadge type={sentence.sentenceType} />,
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
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${sentence.sentenceKey}`}
                            onClick={() => setDeleteTarget(sentence)}
                        >
                            <Trash2 className="h-4 w-4 text-text-muted" />
                        </Button>
                    ) : null}
                </div>
            ),
        },
    ];

    const hasActiveFilters = Boolean(search || status || category || (!fixedSentenceType && sentenceTypeFilter));

    return (
        <div className="flex flex-col gap-6">
            <ContentPageHeader
                title={isShortOnly ? "Short Sentences" : "Sentences"}
                description={
                    isShortOnly
                        ? "Quick, bite-sized spoken phrases and expressions for everyday Arabic conversations."
                        : "Practical spoken sentences. Conversations are built from these — never directly from Arabic Entities."
                }
                primaryAction={
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setGenerateOpen(true)}>
                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                            Generate with AI
                        </Button>
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            {isShortOnly ? "Create short sentence" : "Create sentence"}
                        </Button>
                    </div>
                }
            />

            {generationMessage ? (
                <div
                    role="status"
                    className="flex items-center justify-between gap-3 rounded-default border border-border bg-white p-3 text-sm text-text-secondary"
                >
                    <span>{generationMessage}</span>
                    {generationPendingId ? (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setGenerationCheck((value) => value + 1)}
                        >
                            Check status
                        </Button>
                    ) : null}
                </div>
            ) : null}

            {error ? (
                <div
                    role="alert"
                    className="flex items-center justify-between gap-3 rounded-default border border-error/20 bg-error-bg p-3 text-sm text-error-text"
                >
                    <span>{error}</span>
                    <Button variant="secondary" size="sm" onClick={() => triggerReload(false)}>
                        Retry
                    </Button>
                </div>
            ) : null}

            <SentenceFilterBar
                search={search}
                onSearchChange={(value) => {
                    replaceSentenceListUrl({ search: value.trim() ? value : undefined });
                }}
                statusFilter={statusFilter}
                onStatusChange={(value) => {
                    replaceSentenceListUrl({ status: value.values().next().value });
                }}
                category={category}
                onCategoryChange={(value) => {
                    replaceSentenceListUrl({ category: value || undefined });
                }}
                sentenceType={sentenceTypeFilter}
                onSentenceTypeChange={(value) => {
                    replaceSentenceListUrl({ sentenceType: value || undefined });
                }}
                hideTypeFilter={Boolean(fixedSentenceType)}
                total={total}
                itemLabel={isShortOnly ? "short sentences" : "sentences"}
            />

            {isLoading ? (
                <div role="status" aria-label="Loading sentences" className="flex flex-col gap-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-16 w-full" />
                    ))}
                </div>
            ) : !error && sentences.length === 0 ? (
                <EmptyState
                    icon={MessageSquareOff}
                    title={
                        hasActiveFilters
                            ? "No matching sentences found"
                            : isShortOnly
                                ? "No short sentences found"
                                : "No sentences found"
                    }
                    description="Try adjusting your search or filters, or create a new sentence to get started."
                    action={
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            {isShortOnly ? "Create short sentence" : "Create sentence"}
                        </Button>
                    }
                />
            ) : sentences.length > 0 ? (
                <ContentDataTable
                    columns={columns}
                    rows={sentences}
                    rowKey={(sentence) => sentence.id}
                    getRowHref={(sentence) => `/admin/sentences/${encodeURIComponent(sentence.id)}`}
                    onRowClick={(sentence) =>
                        router.push(`/admin/sentences/${encodeURIComponent(sentence.id)}`)
                    }
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
                                <div className="flex items-center gap-1.5">
                                    <SentenceTypeBadge type={sentence.sentenceType} />
                                    <span>{DIFFICULTY_LABEL[sentence.difficulty]}</span>
                                </div>
                                <span>{sentence.category}</span>
                            </div>
                        </div>
                    )}
                />
            ) : null}

            {sentences.length > 0 ? (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={total}
                    pageSize={PAGE_LIMIT}
                    itemName={isShortOnly ? "short sentences" : "sentences"}
                    isLoading={isLoading}
                    onPageChange={(newPage) => {
                        if (newPage !== page) {
                            replaceSentenceListUrl(
                                { page: newPage > 1 ? String(newPage) : undefined },
                                false,
                            );
                        }
                    }}
                />
            ) : null}

            <SentenceFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                defaultSentenceType={fixedSentenceType ?? "LONG"}
                fixedSentenceType={fixedSentenceType}
                onSave={handleCreate}
            />

            <SentenceAiDialog
                open={generateOpen}
                onOpenChange={setGenerateOpen}
                defaultSentenceType={fixedSentenceType ?? "LONG"}
                fixedSentenceType={fixedSentenceType}
                onGenerated={handleGenerated}
                onBatchGenerated={handleBatchGenerated}
            />

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
