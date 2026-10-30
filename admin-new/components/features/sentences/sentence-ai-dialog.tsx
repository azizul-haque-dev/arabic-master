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
import { generateSentenceAction } from "@/actions/content/sentence-actions";
import {
    SENTENCE_TYPE_LABEL,
    type Sentence,
    type SentenceType,
} from "@/lib/types/content";

export function SentenceAiDialog({
    open,
    onOpenChange,
    defaultSentenceType = "LONG",
    fixedSentenceType,
    onGenerated,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultSentenceType?: SentenceType;
    fixedSentenceType?: SentenceType;
    onGenerated: (sentence: Sentence) => void;
}) {
    const resolvedDefaultType = fixedSentenceType ?? defaultSentenceType;
    const [query, setQuery] = useState("");
    const [sentenceType, setSentenceType] = useState<SentenceType>(resolvedDefaultType);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setSentenceType(resolvedDefaultType);
            setError(null);
        }
    }, [open, resolvedDefaultType]);

    async function handleGenerate() {
        if (isGenerating || !query.trim()) return;
        setIsGenerating(true);
        setError(null);
        try {
            const result = await generateSentenceAction({
                query: query.trim(),
                sentenceType: fixedSentenceType ?? sentenceType,
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
                        Enter an Arabic sentence or a phrase to translate into Arabic. The sentence is created as a draft while the backend job runs.
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
                        <Label htmlFor="sentence-ai-query">Prompt</Label>
                        <Textarea
                            id="sentence-ai-query"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            maxLength={500}
                            rows={4}
                            placeholder="Enter Arabic text or describe the sentence"
                        />
                    </div>

                    {error ? (
                        <p role="alert" className="text-sm text-error-text">
                            {error}
                        </p>
                    ) : null}

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            disabled={isGenerating}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={!query.trim() || isGenerating}
                            onClick={() => void handleGenerate()}
                        >
                            {isGenerating ? "Queueing…" : "Generate"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

