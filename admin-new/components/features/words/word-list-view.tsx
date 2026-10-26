"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookX, Trash2, Sparkles, ListPlus } from "lucide-react";
import { ContentPageHeader } from "@/components/shared/content-page-header";
import { ContentSearch } from "@/components/shared/content-search";
import { ContentStatusFilter } from "@/components/shared/content-filters";
import { ContentDataTable, type DataTableColumn } from "@/components/shared/content-data-table";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { WordFormDialog } from "@/components/features/words/word-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ArabicEntity, ContentStatus, Word, WordFormValues } from "@/lib/types/content";
import { WORD_TYPE_LABEL } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";
import {
  createWordAction,
  deleteWordAction,
  generateWordAction,
  generateWordListAction,
  getWordAction,
  listWordsAction,
} from "@/actions/content/word-actions";
import { buildWordPayload } from "@/lib/words/api";
import { cn } from "@/lib/utils";

const PAGE_LIMIT = 20;

export function WordListView({
  initialWords = [],
  initialMeta = { page: 1, limit: PAGE_LIMIT, total: initialWords.length, totalPages: 1 },
}: {
  initialWords?: Word[];
  initialMeta?: { page: number; limit: number; total: number; totalPages: number };
}) {
  const router = useRouter();
  const { role } = useRole();

  const [words, setWords] = useState<Word[]>(initialWords);
  const [page, setPage] = useState(initialMeta.page);
  const [total, setTotal] = useState(initialMeta.total);
  const [totalPages, setTotalPages] = useState(initialMeta.totalPages);
  const [refreshToken, setRefreshToken] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<ContentStatus>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateMode, setGenerateMode] = useState<"single" | "list">("single");

  const [generationQuery, setGenerationQuery] = useState("");
  const [listQuery, setListQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationMessage, setGenerationMessage] = useState<string | null>(null);
  const [generationPendingId, setGenerationPendingId] = useState<string | null>(null);
  const [generationCheck, setGenerationCheck] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstListEffect = useRef(true);

  const parsedBatchQueries = listQuery
    .split(/[\n,]+/)
    .map((q) => q.trim())
    .filter((q) => q.length > 0);
  const parsedBatchCount = parsedBatchQueries.length;

  useEffect(() => {
    if (firstListEffect.current) {
      firstListEffect.current = false;
      return;
    }
    let active = true;
    setIsLoading(true);
    setError(null);

    listWordsAction({
      page,
      limit: PAGE_LIMIT,
      search: search.trim() || undefined,
      status: statusFilter.values().next().value,
    })
      .then((result) => {
        if (!active) return;
        if (result.success) {
          setWords(result.data.items);
          setTotal(result.data.meta.total);
          setTotalPages(result.data.meta.totalPages);
          if (page > result.data.meta.totalPages && result.data.meta.totalPages > 0) {
            setPage(result.data.meta.totalPages);
          }
        } else {
          setError(result.error);
          setWords([]);
          setTotal(0);
          setTotalPages(1);
        }
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to load words. Please try again.");
        setWords([]);
        setTotal(0);
        setTotalPages(1);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, search, statusFilter, refreshToken]);

  useEffect(() => {
    if (!generationPendingId) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    async function checkGeneration(id: string) {
      try {
        const result = await getWordAction(id);
        if (!active) return;
        if (!result.success) {
          setGenerationMessage(result.error);
          return;
        }
        const word = result.data;
        if (word.meaningEnglish.trim() && word.meaningBangla.trim()) {
          setGenerationMessage(`AI generation completed for ${word.wordKey}.`);
          setGenerationPendingId(null);
          setRefreshToken((value) => value + 1);
          return;
        }
        attempts += 1;
        if (attempts >= 20) {
          setGenerationMessage(
            `Generation is still processing for ${word.wordKey}. Check again shortly.`,
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

    timer = setTimeout(() => void checkGeneration(generationPendingId), 1500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [generationPendingId, generationCheck]);

  async function handleCreate(entity: ArabicEntity, values: WordFormValues) {
    const result = await createWordAction(buildWordPayload(values, entity));
    if (!result.success) throw new Error(result.error);
    setRefreshToken((value) => value + 1);
  }

  async function handleGenerateSingle() {
    if (isGenerating || !generationQuery.trim()) return;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const result = await generateWordAction(generationQuery.trim());
      if (!result.success) {
        setGenerationError(result.error);
        return;
      }
      const queued = result.data;
      if (queued.meaningEnglish.trim() && queued.meaningBangla.trim()) {
        setGenerationMessage(`Word ${queued.wordKey} is ready.`);
        setGenerationPendingId(null);
      } else {
        setGenerationPendingId(queued.id);
        setGenerationMessage(`AI generation queued for ${queued.wordKey}.`);
      }
      setGenerationQuery("");
      setGenerateOpen(false);
      setRefreshToken((value) => value + 1);
    } catch (cause) {
      setGenerationError(
        cause instanceof Error ? cause.message : "Unable to queue word generation.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleGenerateList() {
    if (parsedBatchCount === 0) {
      setGenerationError("Please enter at least one word.");
      return;
    }
    if (parsedBatchCount > 25) {
      setGenerationError("You can generate up to 25 words in a single batch.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    try {
      const result = await generateWordListAction(parsedBatchQueries);
      if (!result.success) {
        setGenerationError(result.error);
        return;
      }

      const results = result.data;
      const queuedCount = results.filter((r) => r.queued).length;
      const failedCount = results.filter((r) => !r.success).length;

      if (failedCount > 0) {
        setGenerationMessage(
          `Batch submitted: ${results.length - failedCount} succeeded (${queuedCount} queued in background), ${failedCount} failed.`,
        );
      } else {
        setGenerationMessage(
          `Batch submitted: ${results.length} words queued for background AI processing.`,
        );
      }

      setListQuery("");
      setGenerateOpen(false);
      setRefreshToken((value) => value + 1);
    } catch (cause) {
      setGenerationError(
        cause instanceof Error ? cause.message : "Unable to queue batch word generation.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDelete(word: Word) {
    const result = await deleteWordAction(word.id);
    if (result.success) {
      setDeleteTarget(null);
      setRefreshToken((value) => value + 1);
    } else {
      setError(result.error);
    }
  }

  const columns: DataTableColumn<Word>[] = [
    {
      key: "arabic",
      header: "Arabic",
      cell: (w) => (
        <div>
          <p dir="rtl" lang="ar" className="font-arabic text-lg leading-relaxed text-text">
            {w.arabicText}
          </p>
          <p className="text-xs text-text-muted">{w.wordKey}</p>
        </div>
      ),
    },
    {
      key: "meaning",
      header: "Meaning",
      cell: (w) => (
        <div>
          <p className="text-text">{w.meaningEnglish}</p>
          <p className="font-bengali text-xs text-text-muted">
            {w.meaningBangla}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (w) => <Badge className="bg-neutral-bg text-neutral-text">{WORD_TYPE_LABEL[w.wordType]}</Badge>,
    },
    {
      key: "category",
      header: "Category",
      cell: (w) => <span className="text-text-secondary">{w.category}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (w) => <ContentStatusBadge status={w.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (w) => (
        <div className="flex justify-end gap-1" onClick={(ev) => ev.stopPropagation()}>
          {role === "ADMIN" ? (
            <Button variant="ghost" size="icon" aria-label={`Delete ${w.wordKey}`} onClick={() => setDeleteTarget(w)}>
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
        title="Words"
        description="Learner-facing vocabulary. Every word reuses a canonical Arabic Entity instead of storing its own Arabic text."
        primaryAction={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setGenerateMode("single");
                setGenerationError(null);
                setGenerateOpen(true);
              }}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Generate with AI
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setGenerateMode("list");
                setGenerationError(null);
                setGenerateOpen(true);
              }}
            >
              <ListPlus className="h-4 w-4" aria-hidden="true" />
              Generate List (AI)
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create word
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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setRefreshToken((value) => value + 1)}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {isLoading ? <div className="text-sm text-text-muted">Loading words…</div> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <ContentSearch
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search Arabic, English, Bangla, category..."
          />
          <ContentStatusFilter
            selected={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            options={["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"]}
            singleSelection
          />
        </div>
        <p className="text-xs text-text-muted">
          {total} {total === 1 ? "word" : "words"}
        </p>
      </div>

      {!error && words.length === 0 ? (
        <EmptyState
          icon={BookX}
          title="No matching words found"
          description="Try adjusting your search or filters, or create a new word to get started."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create word
            </Button>
          }
        />
      ) : words.length > 0 ? (
        <ContentDataTable
          columns={columns}
          rows={words}
          rowKey={(w) => w.id}
          onRowClick={(w) => router.push(`/admin/words/${w.id}`)}
          renderMobileCard={(w) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <p dir="rtl" lang="ar" className="font-arabic text-xl text-text">
                    {w.arabicText}
                  </p>
                  <p className="text-xs text-text-muted">{w.wordKey}</p>
                </div>
                <ContentStatusBadge status={w.status} />
              </div>
              <p className="text-sm text-text">{w.meaningEnglish}</p>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>{WORD_TYPE_LABEL[w.wordType]}</span>
                <span>{w.category}</span>
              </div>
            </div>
          )}
        />
      ) : null}

      {!isLoading && totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                setIsLoading(true);
                setError(null);
                setPage((value) => value - 1);
              }}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => {
                setIsLoading(true);
                setError(null);
                setPage((value) => value + 1);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <WordFormDialog open={createOpen} onOpenChange={setCreateOpen} onSave={handleCreate} />

      <Dialog open={generateOpen} onOpenChange={(open) => !isGenerating && setGenerateOpen(open)}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Generate with AI</DialogTitle>
            <DialogDescription>
              Create vocabulary drafts with AI automatically generating meanings, pronunciations, and usage.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={generateMode}
            onValueChange={(val) => {
              setGenerateMode(val as "single" | "list");
              setGenerationError(null);
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Word</TabsTrigger>
              <TabsTrigger value="list">Word List (Batch)</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="flex flex-col gap-3">
              <label htmlFor="word-ai-query" className="text-sm font-medium text-text">
                Prompt or Arabic Word
              </label>
              <textarea
                id="word-ai-query"
                value={generationQuery}
                onChange={(event) => setGenerationQuery(event.target.value)}
                maxLength={500}
                rows={4}
                className="w-full rounded-default border border-border-strong bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                placeholder="Enter Arabic text (e.g. علبة) or describe the word"
              />
              {generationError ? <p role="alert" className="text-sm text-error-text">{generationError}</p> : null}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" disabled={isGenerating} onClick={() => setGenerateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={!generationQuery.trim() || isGenerating}
                  onClick={() => void handleGenerateSingle()}
                >
                  {isGenerating ? "Queueing…" : "Generate"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="list" className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label htmlFor="word-ai-list-query" className="text-sm font-medium text-text">
                  Arabic Word List (1 - 25 words)
                </label>
                <span
                  className={cn(
                    "text-xs font-medium",
                    parsedBatchCount > 25
                      ? "text-error-text"
                      : "text-text-muted",
                  )}
                >
                  {parsedBatchCount} / 25 words
                </span>
              </div>
              <textarea
                id="word-ai-list-query"
                dir="rtl"
                value={listQuery}
                onChange={(event) => setListQuery(event.target.value)}
                rows={6}
                className="w-full font-arabic text-base rounded-default border border-border-strong bg-white px-3 py-2 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                placeholder={"Enter Arabic words (one per line or comma-separated):\nواحد\nاثنين\nثلاثة\nأربعة\nخمسة"}
              />
              <p className="text-xs text-text-muted">
                Each word will be queued as a background BullMQ job to generate English and Bangla meanings and pronunciations.
              </p>
              {generationError ? <p role="alert" className="text-sm text-error-text">{generationError}</p> : null}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" disabled={isGenerating} onClick={() => setGenerateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={
                    parsedBatchCount === 0 ||
                    parsedBatchCount > 25 ||
                    isGenerating
                  }
                  onClick={() => void handleGenerateList()}
                >
                  {isGenerating
                    ? "Queueing Batch…"
                    : `Generate ${parsedBatchCount > 0 ? `${parsedBatchCount} Words` : "List"}`}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this word?"
        description="This action cannot be undone. The underlying Arabic Entity is not affected."
        onConfirm={() => deleteTarget && void handleDelete(deleteTarget)}
      />
    </div>
  );
}
