"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Pencil, Sparkles, XCircle } from "lucide-react";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { EntityAudioPanel } from "@/components/features/audio/entity-audio-panel";
import { ContentActionBar } from "@/components/shared/content-action-bar";
import { RejectionDialog } from "@/components/shared/rejection-dialog";
import { RelationshipPanel } from "@/components/features/arabic-entities/relationship-panel";
import { EntityFormDialog } from "@/components/features/arabic-entities/entity-form-dialog";
import {
  EntityAiDialog,
  type EntityAiQueuedResult,
} from "@/components/features/arabic-entities/entity-ai-dialog";
import { Button } from "@/components/ui/button";
import type { ArabicEntity, ContentStatus, EntityFormValues } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";
import { checkAudioPermission } from "@/lib/audio/permissions";
import {
  getArabicEntityAction,
  updateArabicEntityAction,
  updateArabicEntityStatusAction,
} from "@/actions/content/arabic-entity-actions";

export function EntityDetailView({ initialEntity }: { initialEntity: ArabicEntity }) {
  const router = useRouter();
  const { role } = useRole();
  const [entity, setEntity] = useState(initialEntity);
  const [editOpen, setEditOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [isPollingAi, setIsPollingAi] = useState(false);
  const [aiResult, setAiResult] = useState<EntityAiQueuedResult | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const audioPermission = checkAudioPermission(role, entity.status);

  async function setStatus(status: ContentStatus, rejectionReason?: string) {
    const res = await updateArabicEntityStatusAction(entity.id, status, rejectionReason);
    if (res.success) {
      setEntity(res.data);
      router.refresh();
    } else {
      alert(res.error);
    }
  }

  async function handleSaveEdit(values: EntityFormValues) {
    const res = await updateArabicEntityAction(entity.id, {
      arabicText: values.arabicText,
      meaningEnglish: values.meaningEnglish,
      meaningBangla: values.meaningBangla,
      pronunciationEnglish: values.pronunciationEnglish,
      pronunciationBangla: values.pronunciationBangla,
    });
    if (res.success) {
      setEntity(res.data);
      setEditOpen(false);
      router.refresh();
    } else {
      alert(res.error);
    }
  }

  function handleAiQueued(queued: EntityAiQueuedResult) {
    setAiResult(queued);
    setIsPollingAi(true);
    setAiMessage(
      `${queued.targetLabel} (${queued.targetKey}) queued for AI generation. Fetching updated content…`,
    );

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const fresh = await getArabicEntityAction(entity.id);
        if (fresh.success && fresh.data) {
          setEntity(fresh.data);
          const hasMeaning =
            Boolean(fresh.data.meaningEnglish?.trim()) &&
            Boolean(fresh.data.meaningBangla?.trim());
          if (hasMeaning || attempts >= 15) {
            clearInterval(interval);
            setIsPollingAi(false);
            setAiMessage(
              hasMeaning
                ? `AI generation completed for ${queued.targetLabel} (${queued.targetKey})!`
                : `AI generation is still running in background for ${queued.targetKey}.`,
            );
            router.refresh();
          }
        }
      } catch {
        if (attempts >= 15) {
          clearInterval(interval);
          setIsPollingAi(false);
        }
      }
    }, 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-1.5 text-xs text-text-muted" aria-label="Breadcrumb">
        <Link href="/admin/arabic-entities" className="hover:text-text">
          Arabic Entities
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="text-text-secondary">{entity.entityKey}</span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div>
            <p dir="rtl" lang="ar" className="font-arabic text-4xl leading-relaxed text-text">
              {entity.arabicText}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-text-muted">Arabic Entity · {entity.entityKey}</span>
              <ContentStatusBadge status={entity.status} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            disabled={isPollingAi}
            onClick={() => setGenerateOpen(true)}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {isPollingAi ? "Generating with AI…" : "Generate with AI"}
          </Button>
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </Button>
        </div>
      </div>

      {aiMessage ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-default border border-border bg-white p-3 text-sm text-text-secondary"
        >
          <span>{aiMessage}</span>
          {aiResult ? (
            <Link
              href={aiResult.href}
              className="text-xs font-medium text-primary hover:underline"
            >
              View {aiResult.targetLabel} ({aiResult.targetKey}) →
            </Link>
          ) : null}
        </div>
      ) : null}

      {entity.status === "REJECTED" && entity.rejectionReason ? (
        <div className="flex gap-2.5 rounded-default border border-error/20 bg-error-bg p-3.5 text-sm text-error-text">
          <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Reason for rejection</p>
            <p className="mt-0.5">{entity.rejectionReason}</p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="font-heading text-sm font-semibold text-text">Meaning</h2>
            <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-text-muted">English</dt>
                <dd className="mt-0.5 text-sm text-text">{entity.meaningEnglish}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Bangla</dt>
                <dd className="mt-0.5 font-bengali text-sm text-text">
                  {entity.meaningBangla}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="font-heading text-sm font-semibold text-text">
              Pronunciation
            </h2>
            <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-text-muted">English</dt>
                <dd className="mt-0.5 text-sm text-text">{entity.pronunciationEnglish}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Bangla</dt>
                <dd className="mt-0.5 font-bengali text-sm text-text">
                  {entity.pronunciationBangla}
                </dd>
              </div>
            </dl>
            <div className="mt-4">
              <EntityAudioPanel
                entityId={entity.id}
                entityLabel={entity.arabicText}
                canEdit={audioPermission.canEdit}
                disabledReason={audioPermission.disabledReason}
                onAudioChange={() => {
                  setEntity((prev) => ({ ...prev, hasAudio: true }));
                }}
              />
            </div>
          </section>

          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="font-heading text-sm font-semibold text-text">
              Review & publishing
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              Signed in as {role === "ADMIN" ? "Admin" : "Content Manager"} — actions below reflect your role.
            </p>
            <div className="mt-4">
              <ContentActionBar
                role={role}
                status={entity.status}
                onSaveDraft={entity.status === "DRAFT" ? () => setStatus("DRAFT") : undefined}
                onSubmitForReview={() => setStatus("IN_REVIEW")}
                onApprove={() => setStatus("APPROVED")}
                onReject={() => setRejectOpen(true)}
                onPublish={() => setStatus("PUBLISHED")}
              />
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <RelationshipPanel entity={entity} />

          <section className="rounded-lg border border-border bg-white p-5 text-xs text-text-muted">
            <h2 className="font-heading text-sm font-semibold text-text">Metadata</h2>
            <dl className="mt-3 flex flex-col gap-2">
              <div className="flex justify-between">
                <dt>Created by</dt>
                <dd className="text-text-secondary">{entity.createdBy}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Created</dt>
                <dd className="text-text-secondary">
                  {new Date(entity.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Last updated</dt>
                <dd className="text-text-secondary">
                  {new Date(entity.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <EntityAiDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        entity={entity}
        onQueued={handleAiQueued}
      />

      <EntityFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initialValues={entity}
        onSaveDraft={handleSaveEdit}
        onUseExisting={(existing) => {
          setEditOpen(false);
          router.push(`/admin/arabic-entities/${existing.id}`);
        }}
      />

      <RejectionDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onSubmit={(reason) => setStatus("REJECTED", reason)}
      />
    </div>
  );
}
