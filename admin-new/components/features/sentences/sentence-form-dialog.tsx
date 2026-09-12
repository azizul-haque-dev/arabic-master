"use client";

import { useState } from "react";
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
import { ArrowLeft } from "lucide-react";
import { EntitySelector } from "@/components/features/arabic-entities/entity-selector";
import { EntityFormDialog } from "@/components/features/arabic-entities/entity-form-dialog";
import { mockArabicEntities } from "@/lib/mock-data/arabic-entities";
import { mockWords } from "@/lib/mock-data/words";
import type {
    ArabicEntity,
    DifficultyLevel,
    EntityFormValues,
    Sentence,
    SentenceFormValues,
} from "@/lib/types/content";
import { DIFFICULTY_LABEL } from "@/lib/types/content";

const emptyValues: SentenceFormValues = {
    meaningBangla: "",
    meaningEnglish: "",
    pronunciationBangla: "",
    pronunciationEnglish: "",
    context: "",
    difficulty: "BEGINNER",
    category: "",
    relatedWordId: undefined,
};

export function SentenceFormDialog({
    open,
    onOpenChange,
    initialSentence,
    onSave,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Pass an existing sentence to edit it (entity becomes fixed); omit to create a new one. */
    initialSentence?: Sentence;
    onSave: (entity: ArabicEntity, values: SentenceFormValues) => void;
}) {
    const isEditing = Boolean(initialSentence);
    const initialEntity = initialSentence
        ? mockArabicEntities.find((e) => e.id === initialSentence.entityId) ?? null
        : null;

    const [step, setStep] = useState<"entity" | "details">(isEditing ? "details" : "entity");
    const [selectedEntity, setSelectedEntity] = useState<ArabicEntity | null>(initialEntity);
    const [entityCreateOpen, setEntityCreateOpen] = useState(false);
    const [entityCreatePrefill, setEntityCreatePrefill] = useState("");
    const [values, setValues] = useState<SentenceFormValues>(
        initialSentence
            ? {
                meaningBangla: initialSentence.meaningBangla,
                meaningEnglish: initialSentence.meaningEnglish,
                pronunciationBangla: initialSentence.pronunciationBangla,
                pronunciationEnglish: initialSentence.pronunciationEnglish,
                context: initialSentence.context,
                difficulty: initialSentence.difficulty,
                category: initialSentence.category,
                relatedWordId: initialSentence.relatedWordId,
            }
            : emptyValues,
    );

    function update<K extends keyof SentenceFormValues>(key: K, value: SentenceFormValues[K]) {
        setValues((prev) => ({ ...prev, [key]: value }));
    }

    function reset() {
        setStep(isEditing ? "details" : "entity");
        setSelectedEntity(initialEntity);
        setValues(
            initialSentence
                ? {
                    meaningBangla: initialSentence.meaningBangla,
                    meaningEnglish: initialSentence.meaningEnglish,
                    pronunciationBangla: initialSentence.pronunciationBangla,
                    pronunciationEnglish: initialSentence.pronunciationEnglish,
                    context: initialSentence.context,
                    difficulty: initialSentence.difficulty,
                    category: initialSentence.category,
                    relatedWordId: initialSentence.relatedWordId,
                }
                : emptyValues,
        );
    }

    function handleClose(nextOpen: boolean) {
        if (!nextOpen) reset();
        onOpenChange(nextOpen);
    }

    function handleEntitySelected(entity: ArabicEntity) {
        setSelectedEntity(entity);
        setStep("details");
    }

    function handleNewEntitySaved(formValues: EntityFormValues) {
        const newEntity: ArabicEntity = {
            id: crypto.randomUUID(),
            entityKey: `AE-${1000 + mockArabicEntities.length + 1}`,
            arabicText: formValues.arabicText,
            normalizedText: formValues.arabicText.trim(),
            meaningBangla: formValues.meaningBangla,
            meaningEnglish: formValues.meaningEnglish,
            pronunciationBangla: formValues.pronunciationBangla,
            pronunciationEnglish: formValues.pronunciationEnglish,
            hasAudio: false,
            status: "DRAFT",
            wordUsageCount: 0,
            sentenceUsageCount: 0,
            conversationUsageCount: 0,
            createdBy: "You",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setEntityCreateOpen(false);
        handleEntitySelected(newEntity);
    }

    return (
        <>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit sentence" : "Create sentence"}</DialogTitle>
                        <DialogDescription>
                            {step === "entity"
                                ? "Every Sentence reuses a canonical Arabic Entity — search before creating a new one."
                                : "Add the learner-facing details for this sentence."}
                        </DialogDescription>
                    </DialogHeader>

                    {step === "entity" ? (
                        <EntitySelector
                            onSelect={handleEntitySelected}
                            onCreateNew={(query) => {
                                setEntityCreatePrefill(query);
                                setEntityCreateOpen(true);
                            }}
                        />
                    ) : (
                        <div className="flex flex-col gap-4">
                            {selectedEntity ? (
                                <div className="flex items-center justify-between rounded-default border border-border bg-background px-3.5 py-2.5">
                                    <div>
                                        <p dir="rtl" lang="ar" className="font-arabic text-2xl text-text">
                                            {selectedEntity.arabicText}
                                        </p>
                                        <p className="text-xs text-text-muted">
                                            {selectedEntity.entityKey} · canonical Arabic Entity
                                        </p>
                                    </div>
                                    {!isEditing ? (
                                        <button
                                            type="button"
                                            onClick={() => setStep("entity")}
                                            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                        >
                                            <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                                            Change
                                        </button>
                                    ) : null}
                                </div>
                            ) : null}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="s-meaning-en">Meaning (English)</Label>
                                    <Input
                                        id="s-meaning-en"
                                        value={values.meaningEnglish}
                                        onChange={(e) => update("meaningEnglish", e.target.value)}
                                        placeholder="How much is it?"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="s-meaning-bn">Meaning (Bangla)</Label>
                                    <Input
                                        id="s-meaning-bn"
                                        value={values.meaningBangla}
                                        onChange={(e) => update("meaningBangla", e.target.value)}
                                        placeholder="দাম কত?"
                                        className="font-bengali"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="s-pron-en">Pronunciation (English)</Label>
                                    <Input
                                        id="s-pron-en"
                                        value={values.pronunciationEnglish}
                                        onChange={(e) => update("pronunciationEnglish", e.target.value)}
                                        placeholder="Kam as-si'r?"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="s-pron-bn">Pronunciation (Bangla)</Label>
                                    <Input
                                        id="s-pron-bn"
                                        value={values.pronunciationBangla}
                                        onChange={(e) => update("pronunciationBangla", e.target.value)}
                                        placeholder="কাম আস-সি'র"
                                        className="font-bengali"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="s-context">Context</Label>
                                <Input
                                    id="s-context"
                                    value={values.context}
                                    onChange={(e) => update("context", e.target.value)}
                                    placeholder="Asking the price of an item in a shop or market"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="s-difficulty">Difficulty</Label>
                                    <select
                                        id="s-difficulty"
                                        value={values.difficulty}
                                        onChange={(e) => update("difficulty", e.target.value as DifficultyLevel)}
                                        className="h-11 w-full rounded-default border border-border-strong bg-white px-3 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                                    >
                                        {Object.entries(DIFFICULTY_LABEL).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="s-category">Category</Label>
                                    <Input
                                        id="s-category"
                                        value={values.category}
                                        onChange={(e) => update("category", e.target.value)}
                                        placeholder="Shopping"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="s-related-word">Related word (optional)</Label>
                                <select
                                    id="s-related-word"
                                    value={values.relatedWordId ?? ""}
                                    onChange={(e) => update("relatedWordId", e.target.value || undefined)}
                                    className="h-11 w-full rounded-default border border-border-strong bg-white px-3 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                                >
                                    <option value="">None</option>
                                    {mockWords.map((w) => (
                                        <option key={w.id} value={w.id}>
                                            {w.arabicText} — {w.meaningEnglish}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-[11px] text-text-muted">
                                    Helps learners see how a word is used in a full sentence.
                                </p>
                            </div>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <Button variant="ghost" onClick={() => handleClose(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    disabled={
                                        !selectedEntity || !values.meaningEnglish.trim() || !values.category.trim()
                                    }
                                    onClick={() => {
                                        if (!selectedEntity) return;
                                        onSave(selectedEntity, values);
                                        handleClose(false);
                                    }}
                                >
                                    Save draft
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <EntityFormDialog
                open={entityCreateOpen}
                onOpenChange={setEntityCreateOpen}
                prefillArabicText={entityCreatePrefill}
                onSaveDraft={handleNewEntitySaved}
                onUseExisting={handleEntitySelected}
            />
        </>
    );
}