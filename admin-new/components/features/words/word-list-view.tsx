"use client";

import { useMemo, useState } from "react";
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
import { mockWords } from "@/lib/mock-data/words";
import type { ArabicEntity, ContentStatus, Word, WordFormValues } from "@/lib/types/content";
import { WORD_TYPE_LABEL } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";

export function WordListView() {
  const router = useRouter();
  const { role } = useRole();

  const [words, setWords] = useState<Word[]>(mockWords);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<ContentStatus>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Word | null>(null);

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

  function handleCreate(entity: ArabicEntity, values: WordFormValues) {
    const newWord: Word = {
      id: crypto.randomUUID(),
      wordKey: `W-${2000 + words.length + 1}`,
      entityId: entity.id,
      arabicText: entity.arabicText,
      ...values,
      status: "DRAFT",
      createdBy: role === "ADMIN" ? "You (Admin)" : "You (Content Manager)",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWords((prev) => [newWord, ...prev]);
  }

  function handleDelete(word: Word) {
    setWords((prev) => prev.filter((w) => w.id !== word.id));
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
          onRowClick={(w) => router.push(`/words/${w.id}`)}
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
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </div>
  );
}
