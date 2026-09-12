"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Volume2, VolumeX, Sparkles, Trash2 } from "lucide-react";
import { ContentPageHeader } from "@/components/shared/content-page-header";
import { ContentSearch } from "@/components/shared/content-search";
import { ContentStatusFilter } from "@/components/shared/content-filters";
import { ContentDataTable, type DataTableColumn } from "@/components/shared/content-data-table";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { EntityFormDialog } from "@/components/features/arabic-entities/entity-form-dialog";
import { RelationshipSummary } from "@/components/features/arabic-entities/relationship-summary";
import { Button } from "@/components/ui/button";
import { mockArabicEntities } from "@/lib/mock-data/arabic-entities";
import type { ArabicEntity, ContentStatus, EntityFormValues } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";

export function EntityListView() {
  const router = useRouter();
  const { role } = useRole();

  const [entities, setEntities] = useState<ArabicEntity[]>(mockArabicEntities);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<ContentStatus>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ArabicEntity | null>(null);

  const filtered = useMemo(() => {
    return entities.filter((entity) => {
      const matchesStatus = statusFilter.size === 0 || statusFilter.has(entity.status);
      const needle = search.trim().toLowerCase();
      const matchesSearch =
        !needle ||
        entity.arabicText.includes(search.trim()) ||
        entity.meaningEnglish.toLowerCase().includes(needle) ||
        entity.meaningBangla.includes(search.trim()) ||
        entity.entityKey.toLowerCase().includes(needle);
      return matchesStatus && matchesSearch;
    });
  }, [entities, search, statusFilter]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map((e) => e.id)),
    );
  }

  function handleSaveDraft(values: EntityFormValues) {
    const newEntity: ArabicEntity = {
      id: crypto.randomUUID(),
      entityKey: `AE-${1000 + entities.length + 1}`,
      arabicText: values.arabicText,
      normalizedText: values.arabicText.trim(),
      meaningBangla: values.meaningBangla,
      meaningEnglish: values.meaningEnglish,
      pronunciationBangla: values.pronunciationBangla,
      pronunciationEnglish: values.pronunciationEnglish,
      hasAudio: false,
      status: "DRAFT",
      wordUsageCount: 0,
      sentenceUsageCount: 0,
      conversationUsageCount: 0,
      createdBy: role === "ADMIN" ? "You (Admin)" : "You (Content Manager)",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEntities((prev) => [newEntity, ...prev]);
  }

  function handleDelete(entity: ArabicEntity) {
    setEntities((prev) => prev.filter((e) => e.id !== entity.id));
  }

  const columns: DataTableColumn<ArabicEntity>[] = [
    {
      key: "arabic",
      header: "Arabic",
      cell: (e) => (
        <div>
          <p dir="rtl" lang="ar" className="font-arabic text-lg leading-relaxed text-text">
            {e.arabicText}
          </p>
          <p className="text-xs text-text-muted">{e.entityKey}</p>
        </div>
      ),
    },
    {
      key: "meaning",
      header: "Meaning",
      cell: (e) => (
        <div>
          <p className="text-text">{e.meaningEnglish}</p>
          <p className="font-bengali text-xs text-text-muted">
            {e.meaningBangla}
          </p>
        </div>
      ),
    },
    {
      key: "usage",
      header: "Used by",
      cell: (e) => <RelationshipSummary entity={e} />,
    },
    {
      key: "audio",
      header: "Audio",
      cell: (e) =>
        e.hasAudio ? (
          <Volume2 className="h-4 w-4 text-primary" aria-label="Audio ready" />
        ) : (
          <VolumeX className="h-4 w-4 text-text-muted" aria-label="No audio yet" />
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (e) => <ContentStatusBadge status={e.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (e) => (
        <div className="flex justify-end gap-1" onClick={(ev) => ev.stopPropagation()}>
          {role === "ADMIN" ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${e.entityKey}`}
              onClick={() => setDeleteTarget(e)}
            >
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
        title="Arabic Entities"
        description="The canonical, reusable Arabic text layer. Words and Sentences reference an entity here instead of storing duplicate Arabic text."
        primaryAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create entity
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <ContentSearch value={search} onChange={setSearch} placeholder="Search Arabic, English, Bangla, or ID..." />
          <ContentStatusFilter
            selected={statusFilter}
            onChange={setStatusFilter}
            options={["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"]}
          />
        </div>
        <p className="text-xs text-text-muted">
          {filtered.length} {filtered.length === 1 ? "entity" : "entities"}
        </p>
      </div>

      {selectedIds.size > 0 && role === "ADMIN" ? (
        <div className="flex items-center gap-3 rounded-default border border-primary/25 bg-primary-light/15 px-4 py-2.5 text-sm">
          <span className="font-medium text-primary-dark">
            {selectedIds.size} selected
          </span>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No matching Arabic entities found"
          description="Try adjusting your search or filters, or create a new entity to get started."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create entity
            </Button>
          }
        />
      ) : (
        <ContentDataTable
          columns={columns}
          rows={filtered}
          rowKey={(e) => e.id}
          onRowClick={(e) => router.push(`/arabic-entities/${e.id}`)}
          selectable={role === "ADMIN"}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          renderMobileCard={(e) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <p dir="rtl" lang="ar" className="font-arabic text-xl text-text">
                    {e.arabicText}
                  </p>
                  <p className="text-xs text-text-muted">{e.entityKey}</p>
                </div>
                <ContentStatusBadge status={e.status} />
              </div>
              <p className="text-sm text-text">{e.meaningEnglish}</p>
              <div className="flex items-center justify-between">
                <RelationshipSummary entity={e} />
                {e.hasAudio ? (
                  <Volume2 className="h-4 w-4 text-primary" aria-label="Audio ready" />
                ) : (
                  <VolumeX className="h-4 w-4 text-text-muted" aria-label="No audio yet" />
                )}
              </div>
            </div>
          )}
        />
      )}

      <EntityFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaveDraft={handleSaveDraft}
        onUseExisting={(entity) => {
          setCreateOpen(false);
          router.push(`/arabic-entities/${entity.id}`);
        }}
      />

      <DeleteConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this Arabic entity?"
        description="This action cannot be undone."
        usageWarning={
          deleteTarget && deleteTarget.wordUsageCount + deleteTarget.sentenceUsageCount > 0
            ? `This entity is currently used by ${deleteTarget.wordUsageCount} Word(s) and ${deleteTarget.sentenceUsageCount} Sentence(s). Deleting it may affect related content. Consider archiving instead.`
            : undefined
        }
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </div>
  );
}
