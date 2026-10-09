"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Pencil, XCircle, Sparkles } from "lucide-react";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { WordFormDialog } from "@/components/features/words/word-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateWordAction } from "@/actions/content/word-actions";
import type { ArabicEntity, Word, WordFormValues } from "@/lib/types/content";
import { WORD_TYPE_LABEL } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";
import { buildWordUpdatePayload } from "@/lib/words/api";
import { useRouter } from "next/navigation";

export function WordDetailView({ initialWord }: { initialWord: Word }) {
  const router = useRouter();
  const { role } = useRole();
  const [word, setWord] = useState(initialWord);
  const [editOpen, setEditOpen] = useState(false);

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
        <Button variant="secondary" onClick={() => setEditOpen(true)}>
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          Edit
        </Button>
      </div>

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
            <h2 className="font-heading text-sm font-semibold text-text">
              Review & publishing
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              Signed in as {role === "ADMIN" ? "Admin" : "Content Manager"} — actions below reflect your role.
            </p>
            <p className="mt-4 text-sm text-text-secondary">
              This API does not currently support changing word review or publishing status.
            </p>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="flex items-center gap-1.5 font-heading text-sm font-semibold text-text">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Source Arabic Entity
            </h2>
            <div className="mt-3 rounded-default border border-border px-3.5 py-2.5">
              <p dir="rtl" lang="ar" className="font-arabic text-lg text-text">
                {word.arabicText || "Arabic text is unavailable."}
              </p>
              <p className="text-xs text-text-muted">Entity ID: {word.entityId}</p>
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
    </div>
  );
}
