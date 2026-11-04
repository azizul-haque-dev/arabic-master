"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Pencil, XCircle, Sparkles } from "lucide-react";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { ContentActionBar } from "@/components/shared/content-action-bar";
import { RejectionDialog } from "@/components/shared/rejection-dialog";
import { WordFormDialog } from "@/components/features/words/word-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getWordAction,
  regenerateWordAction,
  updateWordAction,
  updateWordStatusAction,
} from "@/actions/content/word-actions";
import type { ArabicEntity, ContentStatus, Word, WordFormValues } from "@/lib/types/content";
import { WORD_TYPE_LABEL } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";
import { buildWordUpdatePayload } from "@/lib/words/api";
import { useRouter } from "next/navigation";
import { EntityAudioPanel } from "@/components/features/audio/entity-audio-panel";
import { checkAudioPermission } from "@/lib/audio/permissions";

export function WordDetailView({ initialWord }: { initialWord: Word }) {
  const router = useRouter();
  const { role } = useRole();
  const [word, setWord] = useState(initialWord);
  const [editOpen, setEditOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<ContentStatus>(word.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const allowedStatusOptions: { value: ContentStatus; label: string }[] =
    role === "ADMIN"
      ? [
          { value: "DRAFT", label: "Draft" },
          { value: "IN_REVIEW", label: "In Review" },
          { value: "APPROVED", label: "Approved" },
          { value: "PUBLISHED", label: "Published" },
          { value: "REJECTED", label: "Rejected" },
          { value: "ARCHIVED", label: "Archived" },
        ]
      : [
          { value: "DRAFT", label: "Draft" },
          { value: "IN_REVIEW", label: "In Review" },
        ];

  async function setStatus(status: ContentStatus, rejectionReason?: string) {
    setIsUpdatingStatus(true);
    try {
      const res = await updateWordStatusAction(word.id, status, rejectionReason);
      if (res.success) {
        setWord(res.data);
        setTargetStatus(res.data.status);
        router.refresh();
      } else {
        alert(res.error);
        setTargetStatus(word.status);
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  }
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  async function handleSave(entity: ArabicEntity, values: WordFormValues) {
    const result = await updateWordAction(word.id, buildWordUpdatePayload(values));
    if (!result.success) throw new Error(result.error);
    setWord((prev) => ({
      ...prev,
      ...result.data,
      entityId: entity.id,
      arabicText: entity.arabicText,
    }));
    router.refresh();
  }

  async function handleRegenerate() {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerateError(null);
    setGenerateMessage("AI generation queued in background. Fetching updated content…");

    try {
      const result = await regenerateWordAction(word.id);
      if (!result.success) {
        setGenerateError(result.error);
        setGenerateMessage(null);
        setIsGenerating(false);
        return;
      }

      let attempts = 0;
      const interval = setInterval(async () => {
        attempts += 1;
        try {
          const fresh = await getWordAction(word.id);
          if (fresh.success && fresh.data) {
            const hasMeaning =
              Boolean(fresh.data.meaningEnglish?.trim()) &&
              Boolean(fresh.data.meaningBangla?.trim());
            if (hasMeaning || attempts >= 15) {
              clearInterval(interval);
              setWord(fresh.data);
              setIsGenerating(false);
              setGenerateMessage(
                hasMeaning
                  ? "AI generation completed successfully!"
                  : "Generation is still running in background. Please refresh in a moment.",
              );
              router.refresh();
            }
          }
        } catch {
          if (attempts >= 15) {
            clearInterval(interval);
            setIsGenerating(false);
          }
        }
      }, 2000);
    } catch (cause) {
      setGenerateError(
        cause instanceof Error ? cause.message : "Failed to queue AI generation.",
      );
      setGenerateMessage(null);
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-1.5 text-xs text-text-muted" aria-label="Breadcrumb">
        <Link href="/admin/words" className="hover:text-text">
          Words
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="text-text-secondary">{word.wordKey}</span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p dir="rtl" lang="ar" className="font-arabic text-4xl leading-relaxed text-text">
            {word.arabicText}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-text-muted">Word · {word.wordKey}</span>
            <ContentStatusBadge status={word.status} />
            <Badge className="bg-neutral-bg text-neutral-text">
              {WORD_TYPE_LABEL[word.wordType]}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            disabled={isGenerating}
            onClick={() => void handleRegenerate()}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {isGenerating ? "Generating with AI…" : "Generate with AI"}
          </Button>
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </Button>
        </div>
      </div>

      {generateMessage ? (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-default border border-border bg-white p-3 text-sm text-text-secondary"
        >
          <span>{generateMessage}</span>
        </div>
      ) : null}
      {generateError ? (
        <p role="alert" className="text-sm text-error-text">
          {generateError}
        </p>
      ) : null}

      {word.status === "REJECTED" && word.rejectionReason ? (
        <div className="flex gap-2.5 rounded-default border border-error/20 bg-error-bg p-3.5 text-sm text-error-text">
          <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Reason for rejection</p>
            <p className="mt-0.5">{word.rejectionReason}</p>
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
                <dd className="mt-0.5 text-sm text-text">{word.meaningEnglish}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Bangla</dt>
                <dd className="mt-0.5 font-bengali text-sm text-text">
                  {word.meaningBangla}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Pronunciation (English)</dt>
                <dd className="mt-0.5 text-sm text-text">{word.pronunciationEnglish}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-muted">Pronunciation (Bangla)</dt>
                <dd className="mt-0.5 font-bengali text-sm text-text">
                  {word.pronunciationBangla}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="font-heading text-sm font-semibold text-text">When to use</h2>
            <p className="mt-2 text-sm text-text">{word.whenToUseEnglish || "—"}</p>
            <p className="mt-1 font-bengali text-sm text-text-secondary">
              {word.whenToUseBangla || "—"}
            </p>
          </section>

                    <section className="rounded-lg border border-border bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
              <h2 className="flex items-center gap-1.5 font-heading text-sm font-semibold text-text">
                <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Source Arabic Entity
              </h2>
              <Link
                href={`/admin/arabic-entities/${word.entityId}`}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                View entity →
              </Link>
            </div>
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-default border border-border bg-neutral-bg/40 p-3.5">
              <p dir="rtl" lang="ar" className="font-arabic text-2xl text-text leading-relaxed">
                {word.arabicText || "Arabic text is unavailable."}
              </p>
              <p className="text-xs text-text-muted break-all">
                Entity ID: <span className="font-mono text-text-secondary">{word.entityId}</span>
              </p>
            </div>
            <p className="mt-3 text-xs text-text-secondary leading-relaxed">
              অডিও এই শব্দের সাথে সরাসরি যুক্ত নয়, বরং মূল <strong>Arabic Entity</strong>-র অংশ। এখানে আপলোড বা পরিবর্তন করলে সংযুক্ত Entity-র অডিও আপডেট হবে। (Audio belongs to the underlying Arabic Entity).
            </p>
            <div className="mt-4 border-t border-border pt-4">
              <EntityAudioPanel
                entityId={word.entityId}
                entityLabel={word.arabicText}
                canEdit={checkAudioPermission(role, word.status).canEdit}
                disabledReason={checkAudioPermission(role, word.status).disabledReason}
              />
            </div>
          </section>

          
        </div>

        <div className="flex flex-col gap-6">
          

          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="font-heading text-sm font-semibold text-text">
              Review & publishing
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              Signed in as {role === "ADMIN" ? "Admin" : "Content Manager"} — actions below reflect your role.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-xs text-text-muted">Current status</span>
                <ContentStatusBadge status={word.status} />
              </div>

              <div>
                <label htmlFor="word-status-select" className="block text-xs font-medium text-text-secondary mb-1.5">
                  Change status
                </label>
                <div className="flex items-center gap-2">
                  <select
                    id="word-status-select"
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as ContentStatus)}
                    disabled={isUpdatingStatus}
                    className="h-9 flex-1 rounded-default border border-border-strong bg-white px-2.5 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10"
                  >
                    {allowedStatusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isUpdatingStatus || targetStatus === word.status}
                    onClick={() => {
                      if (targetStatus === "REJECTED") {
                        setRejectOpen(true);
                      } else {
                        void setStatus(targetStatus);
                      }
                    }}
                  >
                    {isUpdatingStatus ? "Saving…" : "Apply"}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-white p-5 text-xs text-text-muted">
            <h2 className="font-heading text-sm font-semibold text-text">Metadata</h2>
            <dl className="mt-3 flex flex-col gap-2">
              <div className="flex justify-between">
                <dt>Category</dt>
                <dd className="text-text-secondary">{word.category}</dd>
              </div>
              {word.lessonName ? (
                <div className="flex justify-between">
                  <dt>Lesson</dt>
                  <dd className="text-text-secondary">{word.lessonName}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt>Created by</dt>
                <dd className="text-text-secondary">{word.createdBy}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Last updated</dt>
                <dd className="text-text-secondary">
                  {new Date(word.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <WordFormDialog open={editOpen} onOpenChange={setEditOpen} initialWord={word} onSave={handleSave} />
      <RejectionDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onSubmit={(reason) => void setStatus("REJECTED", reason)}
      />
    </div>
  );
}
