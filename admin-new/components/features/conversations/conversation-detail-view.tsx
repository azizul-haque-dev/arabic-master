"use client";

import { ConversationMetaDialog } from "@/components/features/conversations/conversation-meta-dialog";
import { ConversationTurnBuilder } from "@/components/features/conversations/conversation-turn-builder";
import { ContentActionBar } from "@/components/shared/content-action-bar";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { RejectionDialog } from "@/components/shared/rejection-dialog";
import { Button } from "@/components/ui/button";
import { mockSentences } from "@/lib/mock-data/sentences";
import { useRole } from "@/lib/role-context";
import type {
  ContentStatus,
  Conversation,
  ConversationMetaFormValues,
  ConversationTurn,
} from "@/lib/types/content";
import { ChevronRight, Eye, Pencil, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function ConversationDetailView({
  initialConversation,
}: {
  initialConversation: Conversation;
}) {
  const { role } = useRole();
  const [conversation, setConversation] = useState(initialConversation);
  const [editMetaOpen, setEditMetaOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  function setStatus(status: ContentStatus, rejectionReason?: string) {
    setConversation((prev) => ({
      ...prev,
      status,
      rejectionReason,
      updatedAt: new Date().toISOString(),
    }));
  }

  function handleMetaSave(values: ConversationMetaFormValues) {
    setConversation((prev) => ({
      ...prev,
      ...values,
      updatedAt: new Date().toISOString(),
    }));
  }

  function handleTurnsChange(turns: ConversationTurn[]) {
    setConversation((prev) => ({
      ...prev,
      turns,
      updatedAt: new Date().toISOString(),
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <nav
        className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]"
        aria-label="Breadcrumb"
      >
        <Link href="/conversations" className="hover:text-[var(--color-text)]">
          Conversations
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="text-[var(--color-text-secondary)]">
          {conversation.conversationKey}
        </span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-text)]">
            {conversation.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--color-text-muted)]">
              {conversation.conversationKey} · {conversation.topic}
            </span>
            <ContentStatusBadge status={conversation.status} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setPreviewOpen((v) => !v)}>
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            {previewOpen ? "Hide preview" : "Preview"}
          </Button>
          <Button variant="secondary" onClick={() => setEditMetaOpen(true)}>
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit details
          </Button>
        </div>
      </div>

      {conversation.status === "REJECTED" && conversation.rejectionReason ? (
        <div className="flex gap-2.5 rounded-[var(--radius-default)] border border-[var(--color-error)]/20 bg-[var(--color-error-bg)] p-3.5 text-sm text-[var(--color-error-text)]">
          <XCircle
            className="mt-0.5 h-4 w-4 flex-shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="font-medium">Reason for rejection</p>
            <p className="mt-0.5">{conversation.rejectionReason}</p>
          </div>
        </div>
      ) : null}

      {previewOpen ? (
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] p-5">
          <h2 className="font-[var(--font-heading)] text-sm font-semibold text-[var(--color-text)]">
            Learner preview
          </h2>
          <div className="mt-4 flex flex-col gap-3 max-w-[480px]">
            {conversation.turns.map((turn) => {
              const sentence = mockSentences.find(
                (s) => s.id === turn.sentenceId,
              );
              if (!sentence) return null;
              return (
                <div
                  key={turn.id}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-3.5"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
                    {turn.speaker}
                  </p>
                  <p
                    dir="rtl"
                    lang="ar"
                    className="mt-1 font-[var(--font-arabic)] text-xl leading-relaxed text-[var(--color-text)]"
                  >
                    {sentence.arabicText}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                    {sentence.meaningEnglish}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
            <h2 className="font-[var(--font-heading)] text-sm font-semibold text-[var(--color-text)]">
              Conversation turns
            </h2>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Built from sentences only — add, reorder, remove, and assign a
              speaker per turn.
            </p>
            <div className="mt-4">
              <ConversationTurnBuilder
                turns={conversation.turns}
                onChange={handleTurnsChange}
              />
            </div>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
            <h2 className="font-[var(--font-heading)] text-sm font-semibold text-[var(--color-text)]">
              Review & publishing
            </h2>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Signed in as {role === "ADMIN" ? "Admin" : "Content Manager"} —
              actions below reflect your role.
            </p>
            <div className="mt-4">
              <ContentActionBar
                role={role}
                status={conversation.status}
                onSaveDraft={
                  conversation.status === "DRAFT"
                    ? () => setStatus("DRAFT")
                    : undefined
                }
                onSubmitForReview={
                  conversation.turns.length > 0
                    ? () => setStatus("IN_REVIEW")
                    : undefined
                }
                onApprove={() => setStatus("APPROVED")}
                onReject={() => setRejectOpen(true)}
                onPublish={() => setStatus("PUBLISHED")}
              />
              {conversation.turns.length === 0 ? (
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                  Add at least one sentence before submitting for review.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 text-xs text-[var(--color-text-muted)]">
            <h2 className="font-[var(--font-heading)] text-sm font-semibold text-[var(--color-text)]">
              Metadata
            </h2>
            <dl className="mt-3 flex flex-col gap-2">
              <div className="flex justify-between">
                <dt>Category</dt>
                <dd className="text-[var(--color-text-secondary)]">
                  {conversation.category}
                </dd>
              </div>
              {conversation.lessonName ? (
                <div className="flex justify-between">
                  <dt>Lesson</dt>
                  <dd className="text-[var(--color-text-secondary)]">
                    {conversation.lessonName}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt>Created by</dt>
                <dd className="text-[var(--color-text-secondary)]">
                  {conversation.createdBy}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Last updated</dt>
                <dd className="text-[var(--color-text-secondary)]">
                  {new Date(conversation.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <ConversationMetaDialog
        open={editMetaOpen}
        onOpenChange={setEditMetaOpen}
        initialConversation={conversation}
        onSave={handleMetaSave}
      />

      <RejectionDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onSubmit={(reason) => setStatus("REJECTED", reason)}
      />
    </div>
  );
}
