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
import type { ArabicEntity, EntityFormValues, Word, WordFormValues, WordType } from "@/lib/types/content";
import { WORD_TYPE_LABEL } from "@/lib/types/content";

const emptyValues: WordFormValues = {
  meaningBangla: "",
  meaningEnglish: "",
  pronunciationBangla: "",
  pronunciationEnglish: "",
  whenToUseBangla: "",
  whenToUseEnglish: "",
  wordType: "OTHER",
  category: "",
};

export function WordFormDialog({
  open,
  onOpenChange,
  initialWord,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass an existing word to edit it (entity becomes fixed); omit to create a new one. */
  initialWord?: Word;
  onSave: (entity: ArabicEntity, values: WordFormValues) => void;
}) {
  const isEditing = Boolean(initialWord);
  const initialEntity = initialWord
    ? mockArabicEntities.find((e) => e.id === initialWord.entityId) ?? null
    : null;

  const [step, setStep] = useState<"entity" | "details">(isEditing ? "details" : "entity");
  const [selectedEntity, setSelectedEntity] = useState<ArabicEntity | null>(initialEntity);
  const [entityCreateOpen, setEntityCreateOpen] = useState(false);
  const [entityCreatePrefill, setEntityCreatePrefill] = useState("");
  const [values, setValues] = useState<WordFormValues>(
    initialWord
      ? {
          meaningBangla: initialWord.meaningBangla,
          meaningEnglish: initialWord.meaningEnglish,
          pronunciationBangla: initialWord.pronunciationBangla,
          pronunciationEnglish: initialWord.pronunciationEnglish,
          whenToUseBangla: initialWord.whenToUseBangla,
          whenToUseEnglish: initialWord.whenToUseEnglish,
          wordType: initialWord.wordType,
          category: initialWord.category,
        }
      : emptyValues,
  );

  function update<K extends keyof WordFormValues>(key: K, value: WordFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setStep(isEditing ? "details" : "entity");
    setSelectedEntity(initialEntity);
    setValues(
      initialWord
        ? {
            meaningBangla: initialWord.meaningBangla,
            meaningEnglish: initialWord.meaningEnglish,
            pronunciationBangla: initialWord.pronunciationBangla,
            pronunciationEnglish: initialWord.pronunciationEnglish,
            whenToUseBangla: initialWord.whenToUseBangla,
            whenToUseEnglish: initialWord.whenToUseEnglish,
            wordType: initialWord.wordType,
            category: initialWord.category,
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
    // Mirrors the create logic in entity-list-view.tsx — in the real app
    // this becomes the API response from POST /arabic-entities.
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
            <DialogTitle>{isEditing ? "Edit word" : "Create word"}</DialogTitle>
            <DialogDescription>
              {step === "entity"
                ? "Every Word reuses a canonical Arabic Entity — search before creating a new one."
                : "Add the learner-facing details for this word."}
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
                  <Label htmlFor="w-meaning-en">Meaning (English)</Label>
                  <Input
                    id="w-meaning-en"
                    value={values.meaningEnglish}
                    onChange={(e) => update("meaningEnglish", e.target.value)}
                    placeholder="Cheap"
                  />
                </div>
                <div>
                  <Label htmlFor="w-meaning-bn">Meaning (Bangla)</Label>
                  <Input
                    id="w-meaning-bn"
                    value={values.meaningBangla}
                    onChange={(e) => update("meaningBangla", e.target.value)}
                    placeholder="সস্তা"
                    className="font-bengali"
                  />
                </div>
                <div>
                  <Label htmlFor="w-pron-en">Pronunciation (English)</Label>
                  <Input
                    id="w-pron-en"
                    value={values.pronunciationEnglish}
                    onChange={(e) => update("pronunciationEnglish", e.target.value)}
                    placeholder="Rakhees"
                  />
                </div>
                <div>
                  <Label htmlFor="w-pron-bn">Pronunciation (Bangla)</Label>
                  <Input
                    id="w-pron-bn"
                    value={values.pronunciationBangla}
                    onChange={(e) => update("pronunciationBangla", e.target.value)}
                    placeholder="রাখিস"
                    className="font-bengali"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="w-when-en">When to use (English)</Label>
                <Input
                  id="w-when-en"
                  value={values.whenToUseEnglish}
                  onChange={(e) => update("whenToUseEnglish", e.target.value)}
                  placeholder="To describe a low price, typically while shopping"
                />
              </div>
              <div>
                <Label htmlFor="w-when-bn">When to use (Bangla)</Label>
                <Input
                  id="w-when-bn"
                  value={values.whenToUseBangla}
                  onChange={(e) => update("whenToUseBangla", e.target.value)}
                  placeholder="দাম কম বোঝাতে, সাধারণত shopping-এর সময়"
                  className="font-bengali"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="w-type">Word type</Label>
                  <select
                    id="w-type"
                    value={values.wordType}
                    onChange={(e) => update("wordType", e.target.value as WordType)}
                    className="h-11 w-full rounded-default border border-border-strong bg-white px-3 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                  >
                    {Object.entries(WORD_TYPE_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-text-muted">
                    Grammar variants (by type) are Phase 2 — not editable here yet.
                  </p>
                </div>
                <div>
                  <Label htmlFor="w-category">Category</Label>
                  <Input
                    id="w-category"
                    value={values.category}
                    onChange={(e) => update("category", e.target.value)}
                    placeholder="Shopping"
                  />
                </div>
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

      {/* Nested: creating a brand-new Arabic Entity from inside the Word flow */}
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
