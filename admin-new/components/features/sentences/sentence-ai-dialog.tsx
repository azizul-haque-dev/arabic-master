"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    generateSentenceAction,
    generateSentenceListAction,
    type SentenceBatchResult,
} from "@/actions/content/sentence-actions";
import {
    SENTENCE_TYPE_LABEL,
    type Sentence,
    type SentenceType,
} from "@/lib/types/content";
import { cn } from "@/lib/utils";

export function SentenceAiDialog({
    open,
    onOpenChange,
    defaultSentenceType = "LONG",
    fixedSentenceType,
    onGenerated,
    onBatchGenerated,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultSentenceType?: SentenceType;
    fixedSentenceType?: SentenceType;
    onGenerated: (sentence: Sentence) => void;
    onBatchGenerated?: (results: SentenceBatchResult[]) => void;
}) {
    const resolvedDefaultType = fixedSentenceType ?? defaultSentenceType;
    const [query, setQuery] = useState("");
    const [sentenceType, setSentenceType] = useState<SentenceType>(resolvedDefaultType);
    const [linkWords, setLinkWords] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingAction, setGeneratingAction] = useState<"single" | "list" | null>(null);
    const [error, setError] = useState<string | null>(null);

    const parsedBatchQueries = query
        .split(/[\n,]+/)
        .map((q) => q.trim())
        .filter((q) => q.length > 0);
    const parsedBatchCount = parsedBatchQueries.length;

    useEffect(() => {
        if (open) {
            setSentenceType(resolvedDefaultType);
            setLinkWords(true);
            setError(null);
        }
    }, [open, resolvedDefaultType]);

    async function handleGenerateSingle() {
        if (isGenerating || !query.trim()) return;
        setIsGenerating(true);
        setGeneratingAction("single");
        setError(null);
        try {
            const result = await generateSentenceAction({
                query: query.trim(),
                sentenceType: fixedSentenceType ?? sentenceType,
                linkWords,
            });
            if (!result.success) {
                setError(result.error);
                return;
            }
            setQuery("");
            onOpenChange(false);
            onGenerated(result.data);
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause.message
                    : "Unable to queue sentence generation.",
            );
        } finally {
            setIsGenerating(false);
            setGeneratingAction(null);
        }
    }

    async function handleGenerateList() {
        if (parsedBatchCount === 0) {
            setError("Please enter at least one sentence.");
            return;
        }
        if (parsedBatchCount > 25) {
            setError("You can generate up to 25 sentences in a single batch.");
            return;
        }

        setIsGenerating(true);
        setGeneratingAction("list");
        setError(null);
        try {
            const result = await generateSentenceListAction({
                query: parsedBatchQueries,
                sentenceType: fixedSentenceType ?? sentenceType,
                linkWords,
            });
            if (!result.success) {
                setError(result.error);
                return;
            }
            setQuery("");
            onOpenChange(false);
            onBatchGenerated?.(result.data);
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause.message
                    : "Unable to queue batch sentence generation.",
            );
        } finally {
            setIsGenerating(false);
            setGeneratingAction(null);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !isGenerating && onOpenChange(nextOpen)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {fixedSentenceType === "SHORT"
                            ? "Generate short sentence with AI"
                            : "Generate sentence with AI"}
                    </DialogTitle>
                    <DialogDescription>
                        Enter an Arabic sentence or phrase to generate a single sentence, or enter multiple sentences (one per line or comma-separated) to generate a batch list.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                    {!fixedSentenceType ? (
                        <div>
                            <Label htmlFor="sentence-ai-type">Sentence type</Label>
                            <select
                                id="sentence-ai-type"
                                value={sentenceType}
                                onChange={(event) =>
                                    setSentenceType(event.target.value as SentenceType)
                                }
                                className="h-11 w-full rounded-default border border-border-strong bg-white px-3 text-sm text-text focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                            >
                                {(Object.entries(SENTENCE_TYPE_LABEL) as [SentenceType, string][]).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>
                    ) : null}

                    <div>
                        <div className="mb-1 flex items-center justify-between">
                            <Label htmlFor="sentence-ai-query" className="mb-0">
                                Prompt / Sentences
                            </Label>
                            {parsedBatchCount > 1 ? (
                                <span
                                    className={cn(
                                        "text-xs font-medium",
                                        parsedBatchCount > 25 ? "text-error-text" : "text-text-muted",
                                    )}
                                >
                                    {parsedBatchCount} / 25 sentences detected
                                </span>
                            ) : null}
                        </div>
                        <Textarea
                            id="sentence-ai-query"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            rows={5}
                            placeholder={"Enter a single sentence (e.g. كم السعر؟) or multiple sentences:\nكم السعر؟\nأين الحمام؟\nأريد هذا"}
                        />
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 rounded-default border border-border bg-neutral-bg/50 px-3 py-2 text-xs text-text-secondary">
                        <input
                            type="checkbox"
                            checked={linkWords}
                            onChange={(event) => setLinkWords(event.target.checked)}
                            className="h-4 w-4 rounded border-border-strong text-primary focus:ring-primary"
                        />
                        <span>
                            Link words automatically for this{" "}
                            {(fixedSentenceType ?? sentenceType) === "SHORT"
                                ? "short sentence"
                                : "sentence"}
                        </span>
                    </label>

                    {error ? (
                        <p role="alert" className="text-sm text-error-text">
                            {error}
                        </p>
                    ) : null}

                    <div className="flex flex-wrap justify-end gap-2 pt-1">
                        <Button
                            variant="ghost"
                            disabled={isGenerating}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            disabled={!query.trim() || isGenerating}
                            onClick={() => void handleGenerateList()}
                        >
                            {isGenerating && generatingAction === "list"
                                ? "Queueing…"
                                : `Generate List${parsedBatchCount > 1 ? ` (${parsedBatchCount})` : ""}`}
                        </Button>
                        <Button
                            disabled={!query.trim() || isGenerating}
                            onClick={() => void handleGenerateSingle()}
                        >
                            {isGenerating && generatingAction === "single"
                                ? "Queueing…"
                                : "Generate One"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
