"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Pencil, XCircle } from "lucide-react";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { AudioPlayer } from "@/components/shared/audio-player";
import { ContentActionBar } from "@/components/shared/content-action-bar";
import { RejectionDialog } from "@/components/shared/rejection-dialog";
import { RelationshipPanel } from "@/components/features/arabic-entities/relationship-panel";
import { EntityFormDialog } from "@/components/features/arabic-entities/entity-form-dialog";
import { Button } from "@/components/ui/button";
import type { ArabicEntity, ContentStatus } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";

export function EntityDetailView({ initialEntity }: { initialEntity: ArabicEntity }) {
  const router = useRouter();
  const { role } = useRole();
  const [entity, setEntity] = useState(initialEntity);
  const [editOpen, setEditOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  function setStatus(status: ContentStatus, rejectionReason?: string) {
    setEntity((prev) => ({ ...prev, status, rejectionReason, updatedAt: new Date().toISOString() }));
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
        <Button variant="secondary" onClick={() => setEditOpen(true)}>
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          Edit
        </Button>
      </div>

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
              <AudioPlayer src={entity.audioUrl} label={entity.arabicText} />
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

      <EntityFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initialValues={entity}
        onSaveDraft={(values) => setEntity((prev) => ({ ...prev, ...values, updatedAt: new Date().toISOString() }))}
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
