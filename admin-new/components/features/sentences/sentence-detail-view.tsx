"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Pencil, XCircle, Sparkles, Type, MessagesSquare, GraduationCap } from "lucide-react";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { ContentActionBar } from "@/components/shared/content-action-bar";
import { RejectionDialog } from "@/components/shared/rejection-dialog";
import { SentenceFormDialog } from "@/components/features/sentences/sentence-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockArabicEntities } from "@/lib/mock-data/arabic-entities";
import { mockWords } from "@/lib/mock-data/words";
import type { ArabicEntity, ContentStatus, Sentence, SentenceFormValues } from "@/lib/types/content";
import { DIFFICULTY_LABEL } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";

export function SentenceDetailView({ initialSentence }: { initialSentence: Sentence }) {
    const { role } = useRole();
    const [sentence, setSentence] = useState(initialSentence);
    const [editOpen, setEditOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);

    const sourceEntity = mockArabicEntities.find((e) => e.id === sentence.entityId);
    const relatedWord = sentence.relatedWordId
        ? mockWords.find((w) => w.id === sentence.relatedWordId)
        : undefined;

    function setStatus(status: ContentStatus, rejectionReason?: string) {
        setSentence((prev) => ({ ...prev, status, rejectionReason, updatedAt: new Date().toISOString() }));
    }

    function handleSave(entity: ArabicEntity, values: SentenceFormValues) {
        setSentence((prev) => ({
            ...prev,
            entityId: entity.id,
            arabicText: entity.arabicText,
            ...values,
            updatedAt: new Date().toISOString(),
        }));
    }

    return (
        <div className="flex flex-col gap-6">
            <nav className="flex items-center gap-1.5 text-xs text-text-muted" aria-label="Breadcrumb">
                <Link href="/sentences" className="hover:text-text">
                    Sentences
                </Link>
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                <span className="text-text-secondary">{sentence.sentenceKey}</span>
            </nav>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p dir="rtl" lang="ar" className="font-arabic text-3xl leading-loose text-text">
                        {sentence.arabicText}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-text-muted">Sentence · {sentence.sentenceKey}</span>
                        <ContentStatusBadge status={sentence.status} />
                        <Badge className="bg-neutral-bg text-neutral-text">
                            {DIFFICULTY_LABEL[sentence.difficulty]}
                        </Badge>
                    </div>
                </div>
                <Button variant="secondary" onClick={() => setEditOpen(true)}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                </Button>
            </div>

            {sentence.status === "REJECTED" && sentence.rejectionReason ? (
                <div className="flex gap-2.5 rounded-default border border-error/20 bg-error-bg p-3.5 text-sm text-error-text">
                    <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <div>
                        <p className="font-medium">Reason for rejection</p>
                        <p className="mt-0.5">{sentence.rejectionReason}</p>
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
                                <dd className="mt-0.5 text-sm text-text">{sentence.meaningEnglish}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-text-muted">Bangla</dt>
                                <dd className="mt-0.5 font-bengali text-sm text-text">
                                    {sentence.meaningBangla}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-text-muted">Pronunciation (English)</dt>
                                <dd className="mt-0.5 text-sm text-text">{sentence.pronunciationEnglish}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-text-muted">Pronunciation (Bangla)</dt>
                                <dd className="mt-0.5 font-bengali text-sm text-text">
                                    {sentence.pronunciationBangla}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section className="rounded-lg border border-border bg-white p-5">
                        <h2 className="font-heading text-sm font-semibold text-text">Context</h2>
                        <p className="mt-2 text-sm text-text">{sentence.context || "—"}</p>
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
                                status={sentence.status}
                                onSaveDraft={sentence.status === "DRAFT" ? () => setStatus("DRAFT") : undefined}
                                onSubmitForReview={() => setStatus("IN_REVIEW")}
                                onApprove={() => setStatus("APPROVED")}
                                onReject={() => setRejectOpen(true)}
                                onPublish={() => setStatus("PUBLISHED")}
                            />
                        </div>
                    </section>
                </div>

                <div className="flex flex-col gap-6">
                    <section className="rounded-lg border border-border bg-white p-5">
                        <h2 className="flex items-center gap-1.5 font-heading text-sm font-semibold text-text">
                            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                            Source Arabic Entity
                        </h2>
                        {sourceEntity ? (
                            <Link
                                href={`/admin/arabic-entities/${sourceEntity.id}`}
                                className="mt-3 flex items-center justify-between rounded-default border border-border px-3.5 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary-light/10"
                            >
                                <div>
                                    <p dir="rtl" lang="ar" className="font-arabic text-lg text-text">
                                        {sourceEntity.arabicText}
                                    </p>
                                    <p className="text-xs text-text-muted">{sourceEntity.entityKey}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-text-muted" aria-hidden="true" />
                            </Link>
                        ) : (
                            <p className="mt-2 text-xs text-text-muted">Source entity not found.</p>
                        )}
                    </section>

                    {relatedWord ? (
                        <section className="rounded-lg border border-border bg-white p-5">
                            <h2 className="flex items-center gap-1.5 font-heading text-sm font-semibold text-text">
                                <Type className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
                                Related word
                            </h2>
                            <Link
                                href={`/words/${relatedWord.id}`}
                                className="mt-3 flex items-center justify-between rounded-default border border-border px-3.5 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary-light/10"
                            >
                                <div>
                                    <p dir="rtl" lang="ar" className="font-arabic text-lg text-text">
                                        {relatedWord.arabicText}
                                    </p>
                                    <p className="text-xs text-text-muted">{relatedWord.meaningEnglish}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-text-muted" aria-hidden="true" />
                            </Link>
                        </section>
                    ) : null}

                    <section className="rounded-lg border border-border bg-white p-5">
                        <h2 className="font-heading text-sm font-semibold text-text">Where this is used</h2>
                        <div className="mt-3 flex gap-3">
                            <div className="flex flex-1 flex-col items-center gap-1 rounded-default border border-border px-3 py-2.5 text-center">
                                <GraduationCap className="h-4 w-4 text-secondary" aria-hidden="true" />
                                <span className="font-heading text-lg font-bold text-text">
                                    {sentence.usedInLessons}
                                </span>
                                <span className="text-[11px] text-text-muted">Lessons</span>
                            </div>
                            <div className="flex flex-1 flex-col items-center gap-1 rounded-default border border-border px-3 py-2.5 text-center">
                                <MessagesSquare className="h-4 w-4 text-secondary" aria-hidden="true" />
                                <span className="font-heading text-lg font-bold text-text">
                                    {sentence.usedInConversations}
                                </span>
                                <span className="text-[11px] text-text-muted">Conversations</span>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-border bg-white p-5 text-xs text-text-muted">
                        <h2 className="font-heading text-sm font-semibold text-text">Metadata</h2>
                        <dl className="mt-3 flex flex-col gap-2">
                            <div className="flex justify-between">
                                <dt>Category</dt>
                                <dd className="text-text-secondary">{sentence.category}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Created by</dt>
                                <dd className="text-text-secondary">{sentence.createdBy}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Last updated</dt>
                                <dd className="text-text-secondary">
                                    {new Date(sentence.updatedAt).toLocaleDateString()}
                                </dd>
                            </div>
                        </dl>
                    </section>
                </div>
            </div>

            <SentenceFormDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                initialSentence={sentence}
                onSave={handleSave}
            />

            <RejectionDialog
                open={rejectOpen}
                onOpenChange={setRejectOpen}
                onSubmit={(reason) => setStatus("REJECTED", reason)}
            />
        </div>
    );
}