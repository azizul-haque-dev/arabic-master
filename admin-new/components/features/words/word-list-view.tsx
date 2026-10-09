"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookX, Trash2 } from "lucide-react";
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
import type { ArabicEntity, ContentStatus, Word, WordFormValues } from "@/lib/types/content";
import { WORD_TYPE_LABEL } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";
import { createWordAction, deleteWordAction, listWordsAction } from "@/actions/content/word-actions";
import { buildWordPayload } from "@/lib/words/api";

export function WordListView({ initialWords = [] }: { initialWords?: Word[] }) {
  const router = useRouter();
  const { role } = useRole();

  const [words, setWords] = useState<Word[]>(initialWords);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<ContentStatus>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSequence = useRef(0);

  async function loadWords(nextSearch: string, nextStatus: ContentStatus | undefined) {
    const sequence = ++requestSequence.current;
    setIsLoading(true);
    setError(null);
    try {
      const result = await listWordsAction({
        page: 1,
        limit: 20,
        search: nextSearch.trim() || undefined,
        status: nextStatus,
      });
      if (sequence !== requestSequence.current) return;
      if (result.success) {
        setWords(result.data.items);
      } else {
        setWords([]);
        setError(result.error);
      }
    } catch {
      if (sequence === requestSequence.current) {
        setWords([]);
        setError("Unable to load words. Please try again.");
      }
    } finally {
      if (sequence === requestSequence.current) setIsLoading(false);
    }
  }

  async function handleCreate(entity: ArabicEntity, values: WordFormValues) {
    const result = await createWordAction(buildWordPayload(values, entity));
    if (!result.success) throw new Error(result.error);
    await loadWords(search, statusFilter.values().next().value);
  }

  async function handleDelete(word: Word) {
    const result = await deleteWordAction(word.id);
    if (result.success) {
      setDeleteTarget(null);
      await loadWords(search, statusFilter.values().next().value);
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
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create word
          </Button>
        }
      />

      {error ? (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-default border border-error/20 bg-error-bg p-3 text-sm text-error-text">
          <span>{error}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void loadWords(search, statusFilter.values().next().value)}
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
              void loadWords(value, statusFilter.values().next().value);
            }}
            placeholder="Search Arabic, English, Bangla, category..."
          />
          <ContentStatusFilter
            selected={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              void loadWords(search, value.values().next().value);
            }}
            options={["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"]}
            singleSelection
          />
        </div>
        <p className="text-xs text-text-muted">
          {words.length} {words.length === 1 ? "word" : "words"}
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

      <WordFormDialog open={createOpen} onOpenChange={setCreateOpen} onSave={handleCreate} />

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
