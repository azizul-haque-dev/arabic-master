"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ChevronRight,
    Pencil,
    XCircle,
    MessagesSquare,
    GraduationCap,
    Loader2,
    RotateCcw,
} from "lucide-react";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { RejectionDialog } from "@/components/shared/rejection-dialog";
import { SentenceFormDialog } from "@/components/features/sentences/sentence-form-dialog";
import { SentenceTypeBadge } from "@/components/features/sentences/sentence-type-badge";
import { SentenceWordLinker } from "@/components/features/sentences/sentence-word-linker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    getSentenceAction,
    getSentenceAiJobStatusAction,
    regenerateSentenceAction,
    regenerateSentenceBanglaPronunciationAction,
    regenerateSentenceContextAction,
    updateSentenceAction,
    updateSentenceStatusAction,
} from "@/actions/content/sentence-actions";
import { buildSentenceUpdatePayload } from "@/lib/sentences/api";
import type { ContentStatus, Sentence, SentenceFormValues, Word } from "@/lib/types/content";
import { DIFFICULTY_LABEL, SENTENCE_TYPE_LABEL } from "@/lib/types/content";
import { useRole } from "@/lib/role-context";
import { EntityAudioPanel } from "@/components/features/audio/entity-audio-panel";
import { checkAudioPermission } from "@/lib/audio/permissions";
import { containsRegionalUsageKeyword } from "@/lib/content/regional-usage-keywords";

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
    const [rejectOpen, setRejectOpen] = useState(false);
    const [targetStatus, setTargetStatus] = useState<ContentStatus>(sentence.status);
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
            const res = await updateSentenceStatusAction(sentence.id, status, rejectionReason);
            if (res.success) {
                setSentence(res.data);
                setTargetStatus(res.data.status);
                router.refresh();
            } else {
                alert(res.error);
                setTargetStatus(sentence.status);
            }
        } finally {
            setIsUpdatingStatus(false);
        }
    }
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateMessage, setGenerateMessage] = useState<string | null>(null);
    const [generateError, setGenerateError] = useState<string | null>(null);
    const [isRegeneratingContext, setIsRegeneratingContext] = useState(false);
    const [contextMessage, setContextMessage] = useState<string | null>(null);
    const [contextError, setContextError] = useState<string | null>(null);
    const [isRegeneratingBanglaPronunciation, setIsRegeneratingBanglaPronunciation] =
        useState(false);
    const [pronunciationMessage, setPronunciationMessage] = useState<string | null>(
        null,
    );
    const [pronunciationError, setPronunciationError] = useState<string | null>(null);
    const autoRegenerateContextStarted = useRef(false);

    async function handleSave(values: SentenceFormValues): Promise<Sentence> {
        const result = await updateSentenceAction(sentence.id, buildSentenceUpdatePayload(values));
        if (!result.success) throw new Error(result.error);
        const sentenceWithArabicText = {
            ...result.data,
            arabicText: result.data.arabicText || sentence.arabicText,
        };
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

    const handleRegenerateContext = useCallback(async () => {
        if (isRegeneratingContext || isGenerating) return;
        setIsRegeneratingContext(true);
        setContextMessage("Context regeneration queued. Waiting for the updated content…");
        setContextError(null);

        try {
            const queued = await regenerateSentenceContextAction(sentence.id);
            if (!queued.success) {
                setContextMessage(null);
                setContextError(queued.error);
                return;
            }

            for (let attempt = 0; attempt < 30; attempt += 1) {
                await new Promise((resolve) => setTimeout(resolve, 2000));
                const status = await getSentenceAiJobStatusAction(queued.data.jobId);
                if (!status.success) {
                    setContextMessage(null);
                    setContextError(status.error);
                    return;
                }
                if (status.data.state === "failed") {
                    setContextMessage(null);
                    setContextError(
                        status.data.failedReason || "AI could not regenerate this context.",
                    );
                    return;
                }
                if (status.data.state === "completed") {
                    const fresh = await getSentenceAction(sentence.id);
                    if (!fresh.success) {
                        setContextMessage(null);
                        setContextError(fresh.error);
                        return;
                    }
                    setSentence((prev) => ({
                        ...fresh.data,
                        arabicText: fresh.data.arabicText || prev.arabicText,
                    }));
                    setContextMessage("Context regenerated successfully.");
                    router.refresh();
                    return;
                }
            }

            setContextMessage(
                "Regeneration is still running in the background. Refresh this page shortly.",
            );
        } catch (cause) {
            setContextMessage(null);
            setContextError(
                cause instanceof Error ? cause.message : "Unable to regenerate context.",
            );
        } finally {
            setIsRegeneratingContext(false);
        }
    }, [isGenerating, isRegeneratingContext, router, sentence.id]);

    const handleRegenerateBanglaPronunciation = useCallback(async () => {
        if (
            isGenerating ||
            isRegeneratingContext ||
            isRegeneratingBanglaPronunciation
        ) {
            return;
        }

        setIsRegeneratingBanglaPronunciation(true);
        setPronunciationMessage(
            "Bangla pronunciation regeneration queued. Waiting for the updated content…",
        );
        setPronunciationError(null);

        try {
            const queued = await regenerateSentenceBanglaPronunciationAction(
                sentence.id,
            );
            if (!queued.success) {
                setPronunciationMessage(null);
                setPronunciationError(queued.error);
                return;
            }

            for (let attempt = 0; attempt < 30; attempt += 1) {
                await new Promise((resolve) => setTimeout(resolve, 2000));
                const status = await getSentenceAiJobStatusAction(queued.data.jobId);
                if (!status.success) {
                    setPronunciationMessage(null);
                    setPronunciationError(status.error);
                    return;
                }
                if (status.data.state === "failed") {
                    setPronunciationMessage(null);
                    setPronunciationError(
                        status.data.failedReason ||
                            "AI could not regenerate the Bangla pronunciation.",
                    );
                    return;
                }
                if (status.data.state === "completed") {
                    const fresh = await getSentenceAction(sentence.id);
                    if (!fresh.success) {
                        setPronunciationMessage(null);
                        setPronunciationError(fresh.error);
                        return;
                    }
                    setSentence((prev) => ({
                        ...fresh.data,
                        arabicText: fresh.data.arabicText || prev.arabicText,
                    }));
                    setPronunciationMessage(
                        "Bangla pronunciation regenerated successfully.",
                    );
                    router.refresh();
                    return;
                }
            }

            setPronunciationMessage(
                "Regeneration is still running in the background. Refresh this page shortly.",
            );
        } catch (cause) {
            setPronunciationMessage(null);
            setPronunciationError(
                cause instanceof Error
                    ? cause.message
                    : "Unable to regenerate Bangla pronunciation.",
            );
        } finally {
            setIsRegeneratingBanglaPronunciation(false);
        }
    }, [
        isGenerating,
        isRegeneratingBanglaPronunciation,
        isRegeneratingContext,
        router,
        sentence.id,
    ]);

    useEffect(() => {
        if (
            autoRegenerateContextStarted.current ||
            !containsRegionalUsageKeyword(
                initialSentence.context,
                initialSentence.contextBangla,
            )
        ) {
            return;
        }

        autoRegenerateContextStarted.current = true;
        void handleRegenerateContext();
    }, [
        handleRegenerateContext,
        initialSentence.context,
        initialSentence.contextBangla,
    ]);

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
                        <span className="text-xs font-medium text-white/60">Sentence · {sentence.sentenceKey}</span>
                        <ContentStatusBadge status={sentence.status} />
                        <SentenceTypeBadge type={sentence.sentenceType} />
                        <Badge className="border border-primary/30 bg-primary/15 text-[#c9c6ff]">
                            {DIFFICULTY_LABEL[sentence.difficulty]}
                        </Badge>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="primary"
                        disabled={
                            isGenerating ||
                            isRegeneratingContext ||
                            isRegeneratingBanglaPronunciation
                        }
                        onClick={() => void handleRegenerate()}
                    >
                        {isGenerating ? "Generating with AI…" : "Generate with AI"}
                    </Button>
                    <Button variant="outline" className="border-primary-light/25 text-primary-light hover:bg-primary-light/10" onClick={() => setEditOpen(true)}>
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
                                <dd className="mt-0.5 flex items-center gap-2 font-bengali text-sm text-text">
                                    <span>{sentence.pronunciationBangla}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-text-muted hover:text-primary"
                                        aria-label="উচ্চারণ আবার তৈরি করুন"
                                        title="উচ্চারণ আবার তৈরি করুন"
                                        disabled={
                                            isGenerating ||
                                            isRegeneratingContext ||
                                            isRegeneratingBanglaPronunciation
                                        }
                                        onClick={() =>
                                            void handleRegenerateBanglaPronunciation()
                                        }
                                    >
                                        {isRegeneratingBanglaPronunciation ? (
                                            <Loader2
                                                className="h-4 w-4 animate-spin"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <RotateCcw className="h-4 w-4" aria-hidden="true" />
                                        )}
                                    </Button>
                                </dd>
                                {pronunciationMessage ? (
                                    <p
                                        role="status"
                                        className="mt-1 text-xs text-text-secondary"
                                    >
                                        {pronunciationMessage}
                                    </p>
                                ) : null}
                                {pronunciationError ? (
                                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                                        <p
                                            role="alert"
                                            className="text-xs text-error-text"
                                        >
                                            {pronunciationError}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            disabled={
                                                isRegeneratingBanglaPronunciation
                                            }
                                            onClick={() =>
                                                void handleRegenerateBanglaPronunciation()
                                            }
                                        >
                                            <RotateCcw
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                            Retry
                                        </Button>
                                    </div>
                                ) : null}
                            </div>
                        </dl>
                    </section>

                    <section className="rounded-lg border border-border bg-white p-5">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="font-heading text-sm font-semibold text-text">Context</h2>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-primary/35 bg-primary/10 text-[#c9c6ff] hover:border-primary/60 hover:bg-primary/20"
                                disabled={
                                    isGenerating ||
                                    isRegeneratingContext ||
                                    isRegeneratingBanglaPronunciation
                                }
                                onClick={() => void handleRegenerateContext()}
                            >
                                {isRegeneratingContext ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                ) : null}
                                {isRegeneratingContext ? "Regenerating…" : "Regenerate"}
                            </Button>
                        </div>
                        {contextMessage ? (
                            <p role="status" className="mt-2 text-xs text-text-secondary">
                                {contextMessage}
                            </p>
                        ) : null}
                        {contextError ? (
                            <p role="alert" className="mt-2 text-xs text-error-text">
                                {contextError}
                            </p>
                        ) : null}
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
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                            <h2 className="flex items-center gap-1.5 font-heading text-sm font-semibold text-text">
                                Source Arabic Entity
                            </h2>
                            <Link
                                href={`/admin/arabic-entities/${sentence.entityId}`}
                                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                            >
                                View entity →
                            </Link>
                        </div>
                        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-default border border-border bg-neutral-bg/40 p-3.5">
                            <p dir="rtl" lang="ar" className="font-arabic text-2xl text-text leading-relaxed">
                                {sentence.arabicText || "Arabic text is not included in this API response."}
                            </p>
                            <p className="text-xs text-text-muted break-all">
                                Entity ID: <span className="font-mono text-text-secondary">{sentence.entityId}</span>
                            </p>
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

                    
                </div>

                <div className="flex flex-col gap-6">
                    

                    <section className="rounded-lg border border-border bg-white p-5">
                        <h2 className="font-heading text-sm font-semibold text-text">
                            Review & publishing
                        </h2>
                        <p className="mt-1 text-xs text-text-muted">
                            Signed in as {role === "ADMIN" ? "Admin" : "Content Manager"}.
                        </p>

                        <div className="mt-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between border-b border-border/50 pb-3">
                                <span className="text-xs text-text-muted">Current status</span>
                                <ContentStatusBadge status={sentence.status} />
                            </div>

                            <div>
                                <label htmlFor="sentence-status-select" className="block text-xs font-medium text-text-secondary mb-1.5">
                                    Change status
                                </label>
                                <div className="flex items-center gap-2">
                                    <select
                                        id="sentence-status-select"
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
                                        disabled={isUpdatingStatus || targetStatus === sentence.status}
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

                    <RejectionDialog
                open={rejectOpen}
                onOpenChange={setRejectOpen}
                onSubmit={(reason) => void setStatus("REJECTED", reason)}
            />
            <SentenceWordLinker
                        sentence={sentence}
                        initialRelatedWord={initialRelatedWord}
                        onSentenceUpdated={setSentence}
                    />

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
