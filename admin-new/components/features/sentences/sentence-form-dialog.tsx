"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContentSearch } from "@/components/shared/content-search";
import { listWordsAction } from "@/actions/content/word-actions";
import { SENTENCE_CATEGORIES } from "@/lib/sentences/categories";
import type { Sentence, SentenceFormValues, Word } from "@/lib/types/content";
import { DIFFICULTY_LABEL } from "@/lib/types/content";

function valuesFor(sentence?: Sentence): SentenceFormValues {
    return {
        arabicText: sentence?.arabicText ?? "",
        meaningBangla: sentence?.meaningBangla ?? "",
        meaningEnglish: sentence?.meaningEnglish ?? "",
        pronunciationBangla: sentence?.pronunciationBangla ?? "",
        pronunciationEnglish: sentence?.pronunciationEnglish ?? "",
        context: sentence?.context ?? "",
        contextBangla: sentence?.contextBangla ?? "",
        feminineEnglish: sentence?.feminineEnglish ?? "",
        feminineBangla: sentence?.feminineBangla ?? "",
        difficulty: sentence?.difficulty ?? "BEGINNER",
        category: sentence?.category ?? "",
        relatedWordId: sentence?.relatedWordId,
    };
}

export function SentenceFormDialog({
    open,
    onOpenChange,
    initialSentence,
    onSave,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialSentence?: Sentence;
    onSave: (values: SentenceFormValues) => Promise<Sentence | void>;
}) {
    const isEditing = Boolean(initialSentence);
    const [values, setValues] = useState(() => valuesFor(initialSentence));
    const [words, setWords] = useState<Word[] | null>(null);
    const [wordSearch, setWordSearch] = useState("");
    const [loadedWordQuery, setLoadedWordQuery] = useState<string | null>(null);
    const [wordsError, setWordsError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        let active = true;
        const query = wordSearch.trim();
        listWordsAction({ page: 1, limit: 100, search: query || undefined })
            .then((result) => {
                if (!active) return;
                if (!result.success) {
                    setWords([]);
                    setLoadedWordQuery(query);
                    setWordsError(result.error);
                    return;
                }
                setWords(result.data.items);
                setLoadedWordQuery(query);
                setWordsError(null);
            })
            .catch((cause: unknown) => {
                if (!active) return;
                setWords([]);
                setLoadedWordQuery(query);
                setWordsError(cause instanceof Error ? cause.message : "Unable to load words.");
            });
        return () => {
            active = false;
        };
    }, [open, wordSearch]);

    function update<K extends keyof SentenceFormValues>(key: K, value: SentenceFormValues[K]) {
        setValues((current) => ({ ...current, [key]: value }));
        setError(null);
    }

    function handleClose(nextOpen: boolean) {
        if (!nextOpen && !isSaving) {
            setValues(valuesFor(initialSentence));
            setError(null);
        }
        if (!isSaving) onOpenChange(nextOpen);
    }

    async function handleSave() {
        if (isSaving) return;
        setIsSaving(true);
        setError(null);
        try {
            const saved = await onSave(values);
            setValues(valuesFor(isEditing && saved ? saved : initialSentence));
            onOpenChange(false);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Unable to save sentence.");
        } finally {
            setIsSaving(false);
        }
    }

    const isValid =
        (isEditing || values.arabicText.trim()) &&
        values.meaningEnglish.trim() &&
        values.meaningBangla.trim() &&
        values.pronunciationEnglish.trim() &&
        values.pronunciationBangla.trim() &&
        values.context.trim() &&
        values.contextBangla.trim() &&
        values.feminineEnglish.trim() &&
        values.feminineBangla.trim() &&
        values.category;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit sentence" : "Create sentence"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the learner-facing details for this sentence."
                            : "Add the Arabic text and learner-facing details for this sentence."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="s-arabic-text">Arabic text</Label>
                        <Input
                            id="s-arabic-text"
                            dir="rtl"
                            lang="ar"
                            value={values.arabicText}
                            onChange={(event) => update("arabicText", event.target.value)}
                            placeholder="مرحبا"
                            className="font-arabic text-lg"
                            readOnly={isEditing}
                        />
                        {isEditing ? (
                            <p className="mt-1 text-[11px] text-text-muted">Arabic text is managed by the linked Arabic Entity and cannot be changed through the sentence update API.</p>
                        ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="s-meaning-en">Meaning (English)</Label>
                            <Input id="s-meaning-en" value={values.meaningEnglish} onChange={(event) => update("meaningEnglish", event.target.value)} placeholder="How much is it?" />
                        </div>
                        <div>
                            <Label htmlFor="s-meaning-bn">Meaning (Bangla)</Label>
                            <Input id="s-meaning-bn" value={values.meaningBangla} onChange={(event) => update("meaningBangla", event.target.value)} placeholder="দাম কত?" className="font-bengali" />
                        </div>
                        <div>
                            <Label htmlFor="s-pron-en">Pronunciation (English)</Label>
                            <Input id="s-pron-en" value={values.pronunciationEnglish} onChange={(event) => update("pronunciationEnglish", event.target.value)} placeholder="Kam as-si'r?" />
                        </div>
                        <div>
                            <Label htmlFor="s-pron-bn">Pronunciation (Bangla)</Label>
                            <Input id="s-pron-bn" value={values.pronunciationBangla} onChange={(event) => update("pronunciationBangla", event.target.value)} placeholder="কাম আস-সি'র" className="font-bengali" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="s-context-en">Context (English)</Label>
                            <Input id="s-context-en" value={values.context} onChange={(event) => update("context", event.target.value)} placeholder="When or how this sentence is used" />
                        </div>
                        <div>
                            <Label htmlFor="s-context-bn">Context (Bangla)</Label>
                            <Input id="s-context-bn" value={values.contextBangla} onChange={(event) => update("contextBangla", event.target.value)} placeholder="কখন বা কীভাবে বাক্যটি ব্যবহার করা হয়" className="font-bengali" />
                        </div>
                        <div>
                            <Label htmlFor="s-feminine-en">Feminine form (English)</Label>
                            <Input id="s-feminine-en" value={values.feminineEnglish} onChange={(event) => update("feminineEnglish", event.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="s-feminine-bn">Feminine form (Bangla)</Label>
                            <Input id="s-feminine-bn" value={values.feminineBangla} onChange={(event) => update("feminineBangla", event.target.value)} className="font-bengali" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="s-difficulty">Difficulty</Label>
                            <select
                                id="s-difficulty"
                                value={values.difficulty}
                                onChange={(event) => update("difficulty", event.target.value as SentenceFormValues["difficulty"])}
                                className="h-11 w-full rounded-default border border-border-strong bg-white px-3 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                            >
                                {Object.entries(DIFFICULTY_LABEL).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="s-category">Category</Label>
                            <select
                                id="s-category"
                                value={values.category}
                                onChange={(event) => update("category", event.target.value)}
                                className="h-11 w-full rounded-default border border-border-strong bg-white px-3 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                            >
                                <option value="">Select category</option>
                                {!SENTENCE_CATEGORIES.includes(values.category as (typeof SENTENCE_CATEGORIES)[number]) && values.category ? (
                                    <option value={values.category}>{values.category}</option>
                                ) : null}
                                {SENTENCE_CATEGORIES.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="s-related-word">Related word (optional)</Label>
                        <ContentSearch
                            value={wordSearch}
                            onChange={setWordSearch}
                            placeholder="Search words by Arabic or meaning..."
                        />
                        <select
                            id="s-related-word"
                            value={values.relatedWordId ?? ""}
                            disabled={loadedWordQuery !== wordSearch.trim() || words === null}
                            onChange={(event) => update("relatedWordId", event.target.value || undefined)}
                            className="h-11 w-full rounded-default border border-border-strong bg-white px-3 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                        >
                            <option value="">
                                {loadedWordQuery !== wordSearch.trim() || words === null ? "Loading words…" : "None"}
                            </option>
                            {values.relatedWordId && !words?.some((word) => word.id === values.relatedWordId) ? (
                                <option value={values.relatedWordId}>Current related word ({values.relatedWordId})</option>
                            ) : null}
                            {words?.map((word) => (
                                <option key={word.id} value={word.id}>{word.arabicText} — {word.meaningEnglish}</option>
                            ))}
                        </select>
                        {wordsError ? <p role="alert" className="mt-1 text-xs text-error-text">{wordsError}</p> : null}
                        <p className="mt-1 text-[11px] text-text-muted">
                            Helps learners see how a word is used in a full sentence.
                        </p>
                    </div>

                    {error ? <p role="alert" className="text-sm text-error-text">{error}</p> : null}

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button variant="ghost" disabled={isSaving} onClick={() => handleClose(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" disabled={!isValid || isSaving} onClick={() => void handleSave()}>
                            {isSaving ? "Saving…" : "Save draft"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
