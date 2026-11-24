"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Volume2, VolumeX, Sparkles, Trash2 } from "lucide-react";
import { ContentPageHeader } from "@/components/shared/content-page-header";
import { ContentSearch } from "@/components/shared/content-search";
import { ContentStatusFilter } from "@/components/shared/content-filters";
import { ContentDataTable, type DataTableColumn } from "@/components/shared/content-data-table";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { Pagination } from "@/components/shared/pagination";
import { EntityFormDialog } from "@/components/features/arabic-entities/entity-form-dialog";
import { ArabicEntityGenerationDialog } from "@/components/features/arabic-entities/arabic-entity-generation-dialog";
import { RelationshipSummary } from "@/components/features/arabic-entities/relationship-summary";
import {
  MissingDataFilter,
  type EntityMissingField,
} from "@/components/features/arabic-entities/missing-data-filter";
import { Button } from "@/components/ui/button";
import type { ArabicEntity, ContentStatus, EntityFormValues } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";
import { AudioUploadDialog } from "@/components/features/audio/audio-upload-dialog";
import { checkAudioPermission } from "@/lib/audio/permissions";
import type {
  ArabicEntityGenerationBatchResult,
  ArabicEntityGenerationResult,
} from "@/actions/content/arabic-entity-actions";

import {
  createArabicEntityAction,
  deleteArabicEntityAction,
  listArabicEntitiesAction,
} from "@/actions/content/arabic-entity-actions";

const PAGE_LIMIT = 50;
const CONTENT_STATUSES: ContentStatus[] = ["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"];

function replaceEntityListUrl(
  updates: Partial<Record<"page" | "search" | "status" | "audio", string | undefined>> & {
    missing?: string[];
  },
  resetPage = true,
) {
  const params = new URLSearchParams(window.location.search);
  if (resetPage) params.delete("page");
  for (const [key, value] of Object.entries(updates)) {
    params.delete(key);
    if (Array.isArray(value)) {
      for (const field of value) params.append(key, field);
    } else if (value) {
      params.set(key, value);
    }
  }
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  if (nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
    window.history.replaceState(null, "", nextUrl);
  }
}

export interface EntityListViewProps {
  initialEntities?: ArabicEntity[];
  initialMeta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function EntityListView({
  initialEntities = [],
  initialMeta = { page: 1, limit: PAGE_LIMIT, total: initialEntities.length, totalPages: 1 },
}: EntityListViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role } = useRole();

  const [entities, setEntities] = useState<ArabicEntity[]>(initialEntities);
  const rawPage = Number(searchParams.get("page"));
  const page = Number.isInteger(rawPage) && rawPage > 0 && rawPage <= 1_000_000 ? rawPage : 1;
  const search = searchParams.get("search") ?? "";
  const status = CONTENT_STATUSES.find((value) => value === searchParams.get("status"));
  const statusFilter = new Set<ContentStatus>(status ? [status] : []);
  const audioValue = searchParams.get("audio");
  const audio = audioValue === "with" || audioValue === "without" ? audioValue : undefined;
  const searchParamsString = searchParams.toString();
  const missing = useMemo(
    () => new URLSearchParams(searchParamsString)
      .getAll("missing")
      .filter((value): value is EntityMissingField =>
      value === "meaningEnglish" ||
      value === "meaningBangla" ||
      value === "pronunciationEnglish" ||
      value === "pronunciationBangla",
      ),
    [searchParamsString],
  );
  const [total, setTotal] = useState(initialMeta.total);
  const [totalPages, setTotalPages] = useState(initialMeta.totalPages);
  const [refreshToken, setRefreshToken] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstListEffect = useRef(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ArabicEntity | null>(null);
  const [audioTarget, setAudioTarget] = useState<ArabicEntity | null>(null);
  const [aiGenerateOpen, setAiGenerateOpen] = useState(false);
  const [generationMessage, setGenerationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (firstListEffect.current) {
      firstListEffect.current = false;
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    listArabicEntitiesAction({
      page,
      limit: PAGE_LIMIT,
      search: search.trim() || undefined,
      status,
      audio,
      missing: missing.length > 0 ? missing : undefined,
    })
      .then((result) => {
        if (!active) return;
        if (result.success) {
          setEntities(result.data.items);
          setTotal(result.data.meta.total);
          setTotalPages(result.data.meta.totalPages);
          if (page > Math.max(1, result.data.meta.totalPages)) {
            replaceEntityListUrl({
              page: result.data.meta.totalPages > 1 ? String(result.data.meta.totalPages) : undefined,
            }, false);
          }
        } else {
          setError(result.error);
          setEntities([]);
          setTotal(0);
          setTotalPages(1);
        }
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to load Arabic entities. Please try again.");
        setEntities([]);
        setTotal(0);
        setTotalPages(1);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, search, status, audio, missing, searchParamsString, refreshToken]);

  function addGeneratedEntity(result: ArabicEntityGenerationResult) {
    setGenerationMessage(
      result.created
        ? `Created Arabic entity ${result.entity.entityKey}.`
        : `Arabic entity ${result.entity.entityKey} already exists.`,
    );
    setRefreshToken((value) => value + 1);
  }

  function addGeneratedEntities(results: ArabicEntityGenerationBatchResult[]) {
    const successful = results.filter(
      (result): result is Extract<ArabicEntityGenerationBatchResult, { success: true }> =>
        result.success,
    );
    const created = successful.filter((result) => result.created);

    const failedCount = results.length - successful.length;
    const existingCount = successful.length - created.length;
    const summary = [
      `${created.length} created`,
      existingCount > 0 ? `${existingCount} already existed` : null,
      failedCount > 0 ? `${failedCount} failed` : null,
    ]
      .filter(Boolean)
      .join(", ");
    setGenerationMessage(`AI entity batch complete: ${summary}.`);
    setRefreshToken((value) => value + 1);
  }

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
      prev.size === entities.length ? new Set() : new Set(entities.map((e) => e.id)),
    );
  }

  async function handleSaveDraft(values: EntityFormValues) {
    const res = await createArabicEntityAction({
      arabicText: values.arabicText,
      meaningEnglish: values.meaningEnglish,
      meaningBangla: values.meaningBangla,
      pronunciationEnglish: values.pronunciationEnglish,
      pronunciationBangla: values.pronunciationBangla,
      status: "DRAFT",
    });

    if (res.success) {
      setCreateOpen(false);
      setRefreshToken((value) => value + 1);
    } else {
      alert(res.error);
    }
  }

  async function handleDelete(entity: ArabicEntity) {
    const res = await deleteArabicEntityAction(entity.id);
    if (res.success) {
      setEntities((prev) => prev.filter((e) => e.id !== entity.id));
      setDeleteTarget(null);
      setRefreshToken((value) => value + 1);
    } else {
      alert(res.error);
    }
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
      cell: (e) => (
        <button
          type="button"
          onClick={(ev) => {
            ev.stopPropagation();
            setAudioTarget(e);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-sm hover:bg-neutral-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={
            e.hasAudio
              ? `Audio available for ${e.entityKey}. Click to manage audio.`
              : `No audio for ${e.entityKey}. Click to upload audio.`
          }
          title={e.hasAudio ? "Audio ready (Click to upload/manage)" : "No audio (Click to upload)"}
        >
          {e.hasAudio ? (
            <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
          ) : (
            <VolumeX className="h-4 w-4 text-text-muted hover:text-text" aria-hidden="true" />
          )}
        </button>
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
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Upload or manage audio for ${e.entityKey}`}
            title="Upload audio"
            onClick={() => setAudioTarget(e)}
          >
            <Volume2 className="h-4 w-4 text-text-muted hover:text-primary" />
          </Button>
          {role === "ADMIN" ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${e.entityKey}`}
              onClick={() => setDeleteTarget(e)}
            >
              <Trash2 className="h-4 w-4 text-text-muted hover:text-error-text" />
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
          <>
            <Button
              variant="outline"
              onClick={() => {
                setGenerationMessage(null);
                setAiGenerateOpen(true);
              }}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Generate with AI
            </Button>
            <Button onClick={() => setCreateOpen(true)} className="create-action-button">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create entity
            </Button>
          </>
        }
      />

      {generationMessage ? (
        <p role="status" className="rounded-default border border-primary/25 bg-primary-light/15 px-4 py-2.5 text-sm text-primary-dark">
          {generationMessage}
        </p>
      ) : null}
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
      {isLoading ? <div className="text-sm text-text-muted">Loading Arabic entities…</div> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <ContentSearch
            key={search}
            value={search}
            onChange={(value) => {
              if (value !== search) replaceEntityListUrl({ search: value.trim() ? value : undefined });
            }}
            placeholder="Search Arabic, English, Bangla, or ID..."
          />
          <ContentStatusFilter
            selected={statusFilter}
            onChange={(value) => {
              replaceEntityListUrl({ status: value.values().next().value });
            }}
            options={CONTENT_STATUSES}
            singleSelection
          />
          <label className="sr-only" htmlFor="entity-audio-filter">Filter entities by audio</label>
          <select
            id="entity-audio-filter"
            aria-label="Filter entities by audio"
            className="h-9 rounded-default border border-border-strong bg-white px-3 text-sm text-text"
            value={audio ?? "all"}
            onChange={(event) => {
              replaceEntityListUrl({ audio: event.target.value === "all" ? undefined : event.target.value });
            }}
          >
            <option value="all">All audio</option>
            <option value="with">With audio</option>
            <option value="without">Without audio</option>
          </select>
          <MissingDataFilter
            selected={missing}
            onChange={(value) => {
              replaceEntityListUrl({ missing: value });
            }}
          />
        </div>
        <p className="text-xs text-text-muted">
          {total} {total === 1 ? "entity" : "entities"}
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

      {!error && entities.length === 0 && !isLoading ? (
        <EmptyState
          icon={Sparkles}
          title="No matching Arabic entities found"
          description="Try adjusting your search or filters, or create a new entity to get started."
          action={
            <Button onClick={() => setCreateOpen(true)} className="create-action-button">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create entity
            </Button>
          }
        />
      ) : entities.length > 0 ? (
        <ContentDataTable
          columns={columns}
          rows={entities}
          rowKey={(e) => e.id}
          onRowClick={(e) => router.push(`/admin/arabic-entities/${e.id}`)}
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
                <button
                  type="button"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setAudioTarget(e);
                  }}
                  className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs hover:bg-neutral-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[36px]"
                  aria-label={
                    e.hasAudio
                      ? `Audio available for ${e.entityKey}. Click to manage.`
                      : `No audio for ${e.entityKey}. Click to upload.`
                  }
                >
                  {e.hasAudio ? (
                    <>
                      <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span className="text-primary font-medium">Audio</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4 text-text-muted" aria-hidden="true" />
                      <span className="text-text-muted">+ Audio</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        />
      ) : null}

      {entities.length > 0 ? (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={PAGE_LIMIT}
          itemName="entities"
          isLoading={isLoading}
          onPageChange={(newPage) => {
            if (newPage !== page) {
              replaceEntityListUrl({ page: newPage > 1 ? String(newPage) : undefined }, false);
            }
          }}
        />
      ) : null}

      <EntityFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        existingEntities={entities}
        onSaveDraft={handleSaveDraft}
        onUseExisting={(entity) => {
          setCreateOpen(false);
          router.push(`/admin/arabic-entities/${entity.id}`);
        }}
      />

      <ArabicEntityGenerationDialog
        open={aiGenerateOpen}
        onOpenChange={setAiGenerateOpen}
        onGenerated={addGeneratedEntity}
        onBatchGenerated={addGeneratedEntities}
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

      {audioTarget ? (
        <AudioUploadDialog
          open={Boolean(audioTarget)}
          onOpenChange={(open) => {
            if (!open) setAudioTarget(null);
          }}
          entityId={audioTarget.id}
          entityLabel={audioTarget.arabicText}
          canEdit={checkAudioPermission(role, audioTarget.status).canEdit}
          disabledReason={checkAudioPermission(role, audioTarget.status).disabledReason}
          onUploaded={() => {
            setRefreshToken((value) => value + 1);
          }}
        />
      ) : null}
    </div>
  );
}
