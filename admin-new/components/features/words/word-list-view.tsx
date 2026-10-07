"use client";

import { useEffect, useMemo, useState } from "react";
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
import { buildWordPayload, createWord, deleteWord, fetchWords } from "@/lib/words/api";

export function WordListView({ initialWords = [] }: { initialWords?: Word[] }) {
  const router = useRouter();
  const { role } = useRole();

  const [words, setWords] = useState<Word[]>(initialWords);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<ContentStatus>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setWords(initialWords);
  }, [initialWords]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    fetchWords({
      page: 1,
      limit: 20,
      search: search.trim() || undefined,
      status: statusFilter.size === 1 ? Array.from(statusFilter)[0] : undefined,
    })
      .then((result) => {
        if (!active) return;
        setWords(result.items);
      })
      .catch(() => {
        if (!active) return;
        setWords([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, statusFilter]);

  const filtered = useMemo(() => {
    return words.filter((word) => {
      const matchesStatus = statusFilter.size === 0 || statusFilter.has(word.status);
      const needle = search.trim().toLowerCase();
      const matchesSearch =
        !needle ||
        word.arabicText.includes(search.trim()) ||
        word.meaningEnglish.toLowerCase().includes(needle) ||
        word.meaningBangla.includes(search.trim()) ||
        word.wordKey.toLowerCase().includes(needle) ||
        word.category.toLowerCase().includes(needle);
      return matchesStatus && matchesSearch;
    });
  }, [words, search, statusFilter]);

  async function handleCreate(entity: ArabicEntity, values: WordFormValues) {
    try {
      const savedWord = await createWord(buildWordPayload(values, entity));
      setWords((prev) => [savedWord, ...prev]);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(word: Word) {
    try {
      await deleteWord(word.id);
      setWords((prev) => prev.filter((w) => w.id !== word.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
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

      {isLoading ? <div className="text-sm text-text-muted">Loading words…</div> : null}

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
          {filtered.length} {filtered.length === 1 ? "word" : "words"}
        </p>
      </div>

      {filtered.length === 0 ? (
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
      ) : (
        <ContentDataTable
          columns={columns}
          rows={filtered}
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
      )}

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
