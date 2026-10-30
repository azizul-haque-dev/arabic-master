"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Pencil, XCircle, Sparkles, Type, MessagesSquare, GraduationCap } from "lucide-react";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { SentenceFormDialog } from "@/components/features/sentences/sentence-form-dialog";
import { SentenceTypeBadge } from "@/components/features/sentences/sentence-type-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    getSentenceAction,
    regenerateSentenceAction,
    resyncSentenceWordsAction,
    updateSentenceAction,
} from "@/actions/content/sentence-actions";
import { buildSentenceUpdatePayload } from "@/lib/sentences/api";
import type { Sentence, SentenceFormValues, Word } from "@/lib/types/content";
import { DIFFICULTY_LABEL, SENTENCE_TYPE_LABEL } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";
import { EntityAudioPanel } from "@/components/features/audio/entity-audio-panel";
import { checkAudioPermission } from "@/lib/audio/permissions";

export function SentenceDetailView({
    initialSentence,
    initialRelatedWord,
}: {
    initialSentence: Sentence;
    initialRelatedWord?: Word;
}) {
    const router = useRouter();
    const { role } = useRole();
    const [sentence, setSentence] = useState(initialSentence);
    const [editOpen, setEditOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateMessage, setGenerateMessage] = useState<string | null>(null);
    const [generateError, setGenerateError] = useState<string | null>(null);
    const [isResyncing, setIsResyncing] = useState(false);
    const [resyncMessage, setResyncMessage] = useState<string | null>(null);
    const [resyncError, setResyncError] = useState<string | null>(null);

    async function handleSave(values: SentenceFormValues): Promise<Sentence> {
        const result = await updateSentenceAction(sentence.id, buildSentenceUpdatePayload(values));
        if (!result.success) throw new Error(result.error);
        const sentenceWithArabicText = { ...result.data, arabicText: sentence.arabicText };
        setSentence(sentenceWithArabicText);
        router.refresh();
        return sentenceWithArabicText;
    }

    async function handleRegenerate() {
        if (isGenerating) return;
        setIsGenerating(true);
        setGenerateError(null);
        setGenerateMessage("AI generation queued in background. Fetching updated content…");

        try {
            const result = await regenerateSentenceAction(sentence.id);
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
                    const fresh = await getSentenceAction(sentence.id);
                    if (fresh.success && fresh.data) {
                        const hasMeaning =
                            Boolean(fresh.data.meaningEnglish?.trim()) &&
                            Boolean(fresh.data.meaningBangla?.trim());
                        if (hasMeaning || attempts >= 15) {
                            clearInterval(interval);
                            setSentence((prev) => ({
                                ...fresh.data,
                                arabicText: fresh.data.arabicText || prev.arabicText,
                            }));
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

    async function handleResyncWords() {
        if (isResyncing) return;
        setIsResyncing(true);
        setResyncError(null);
        setResyncMessage(null);
        try {
            const result = await resyncSentenceWordsAction(sentence.id);
            if (!result.success) {
                setResyncError(result.error);
                return;
            }
            setResyncMessage("Word-link resync was queued.");
        } catch (cause) {
            setResyncError(cause instanceof Error ? cause.message : "Unable to queue word-link resync.");
        } finally {
            setIsResyncing(false);
        }
    }

    const listHref = sentence.sentenceType === "SHORT" ? "/admin/short-sentences" : "/admin/sentences";
    const listLabel = sentence.sentenceType === "SHORT" ? "Short Sentences" : "Sentences";

    return (
        <div className="flex flex-col gap-6">
            <nav className="flex items-center gap-1.5 text-xs text-text-muted" aria-label="Breadcrumb">
                <Link href={listHref} className="hover:text-text">
                    {listLabel}
                </Link>
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                <span className="text-text-secondary">{sentence.sentenceKey}</span>
            </nav>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p dir="rtl" lang="ar" className="font-arabic text-3xl leading-loose text-text">
                        {sentence.arabicText || "Arabic text is not included in this API response."}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-text-muted">Sentence · {sentence.sentenceKey}</span>
                        <ContentStatusBadge status={sentence.status} />
                        <SentenceTypeBadge type={sentence.sentenceType} />
                        <Badge className="bg-neutral-bg text-neutral-text">
                            {DIFFICULTY_LABEL[sentence.difficulty]}
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
                        <dl className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs text-text-muted">English</dt>
                                <dd className="mt-0.5 text-sm text-text">{sentence.context || "—"}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-text-muted">Bangla</dt>
                                <dd className="mt-0.5 font-bengali text-sm text-text">{sentence.contextBangla || "—"}</dd>
                            </div>
                        </dl>
                        <div className="mt-3 border-t border-border pt-3">
                            <p className="text-xs text-text-muted">Feminine form</p>
                            <p className="mt-0.5 text-sm text-text">{sentence.feminineEnglish || "—"}</p>
                            <p className="font-bengali text-sm text-text">{sentence.feminineBangla || "—"}</p>
                        </div>
                    </section>

                    <section className="rounded-lg border border-border bg-white p-5">
                        <h2 className="font-heading text-sm font-semibold text-text">
                            Review & publishing
                        </h2>
                        <p className="mt-1 text-xs text-text-muted">
                            Signed in as {role === "ADMIN" ? "Admin" : "Content Manager"}.
                        </p>
                        <p className="mt-4 text-sm text-text-secondary">
                            This API does not currently support changing sentence review or publishing status.
                        </p>
                    </section>
                </div>

                <div className="flex flex-col gap-6">
                    <section className="rounded-lg border border-border bg-white p-5">
                        <div className="flex items-center justify-between pb-1">
                            <h2 className="flex items-center gap-1.5 font-heading text-sm font-semibold text-text">
                                <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                                Source Arabic Entity
                            </h2>
                            <Link
                                href={`/admin/arabic-entities/${sentence.entityId}`}
                                className="text-xs text-primary hover:underline"
                            >
                                View entity →
                            </Link>
                        </div>
                        <div className="mt-2 rounded-default border border-border px-3.5 py-2.5">
                            <p dir="rtl" lang="ar" className="font-arabic text-xl text-text">
                                {sentence.arabicText || "Arabic text is not included in this API response."}
                            </p>
                            <p className="mt-1 text-xs text-text-muted">Entity ID: {sentence.entityId}</p>
                        </div>
                        <div className="mt-3 flex flex-col gap-2">
                            <Button variant="secondary" size="sm" disabled={isResyncing} onClick={() => void handleResyncWords()}>
                                {isResyncing ? "Queueing…" : "Resync word links"}
                            </Button>
                            {resyncMessage ? <p role="status" className="text-xs text-text-secondary">{resyncMessage}</p> : null}
                            {resyncError ? <p role="alert" className="text-xs text-error-text">{resyncError}</p> : null}
                        </div>
                        <p className="mt-3 text-xs text-text-secondary leading-relaxed">
                            অডিও এই বাক্যের সাথে সরাসরি যুক্ত নয়, বরং মূল <strong>Arabic Entity</strong>-র অংশ। এখানে আপলোড বা পরিবর্তন করলে সংযুক্ত Entity-র অডিও আপডেট হবে। (Audio belongs to the underlying Arabic Entity).
                        </p>
                        <div className="mt-4 border-t border-border pt-4">
                            <EntityAudioPanel
                                entityId={sentence.entityId}
                                entityLabel={sentence.arabicText}
                                canEdit={checkAudioPermission(role, sentence.status).canEdit}
                                disabledReason={checkAudioPermission(role, sentence.status).disabledReason}
                            />
                        </div>
                    </section>

                    {initialRelatedWord ? (
                        <section className="rounded-lg border border-border bg-white p-5">
                            <h2 className="flex items-center gap-1.5 font-heading text-sm font-semibold text-text">
                                <Type className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
                                Related word
                            </h2>
                            <Link
                                href={`/admin/words/${initialRelatedWord.id}`}
                                className="mt-3 flex items-center justify-between rounded-default border border-border px-3.5 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary-light/10"
                            >
                                <div>
                                    <p dir="rtl" lang="ar" className="font-arabic text-lg text-text">
                                        {initialRelatedWord.arabicText}
                                    </p>
                                    <p className="text-xs text-text-muted">{initialRelatedWord.meaningEnglish}</p>
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
                                    {sentence.usedInLessons ?? "—"}
                                </span>
                                <span className="text-[11px] text-text-muted">Lessons</span>
                            </div>
                            <div className="flex flex-1 flex-col items-center gap-1 rounded-default border border-border px-3 py-2.5 text-center">
                                <MessagesSquare className="h-4 w-4 text-secondary" aria-hidden="true" />
                                <span className="font-heading text-lg font-bold text-text">
                                    {sentence.usedInConversations ?? "—"}
                                </span>
                                <span className="text-[11px] text-text-muted">Conversations</span>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-border bg-white p-5 text-xs text-text-muted">
                        <h2 className="font-heading text-sm font-semibold text-text">Metadata</h2>
                        <dl className="mt-3 flex flex-col gap-2">
                            <div className="flex justify-between">
                                <dt>Type</dt>
                                <dd className="text-text-secondary">{SENTENCE_TYPE_LABEL[sentence.sentenceType]}</dd>
                            </div>
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
        </div>
    );
}
