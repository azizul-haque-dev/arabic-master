"use client";

import { useMemo, useState } from "react";
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
import { RelationshipSummary } from "@/components/features/arabic-entities/relationship-summary";
import { mockArabicEntities } from "@/lib/mock-data/arabic-entities";
import { normalizeArabic } from "@/lib/normalize-arabic";
import type { ArabicEntity, EntityFormValues } from "@/lib/types/content";
import { AlertCircle } from "lucide-react";
import { EntityAudioPanel } from "@/components/features/audio/entity-audio-panel";
import { checkAudioPermission } from "@/lib/audio/permissions";
import { useRole } from "@/lib/role-context";

const emptyValues: EntityFormValues = {
  arabicText: "",
  meaningBangla: "",
  meaningEnglish: "",
  pronunciationBangla: "",
  pronunciationEnglish: "",
};

export function EntityFormDialog({
  open,
  onOpenChange,
  initialValues,
  prefillArabicText,
  existingEntities,
  onSaveDraft,
  onUseExisting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass an entity to edit it; omit to create a new one. */
  initialValues?: ArabicEntity;
  /** Create-mode only: pre-fill the Arabic text field (e.g. from a search query elsewhere). */
  prefillArabicText?: string;
  existingEntities?: ArabicEntity[];
  onSaveDraft: (values: EntityFormValues) => void;
  onUseExisting: (entity: ArabicEntity) => void;
}) {
  const isEditing = Boolean(initialValues);
  const { role } = useRole();
  const startingValues: EntityFormValues = initialValues ?? {
    ...emptyValues,
    arabicText: prefillArabicText ?? "",
  };
  const [values, setValues] = useState<EntityFormValues>(startingValues);
  const [acknowledgedDuplicate, setAcknowledgedDuplicate] = useState(false);

  const normalized = useMemo(() => normalizeArabic(values.arabicText), [values.arabicText]);
  const pool = existingEntities && existingEntities.length > 0 ? existingEntities : mockArabicEntities;

  const exactDuplicate = useMemo(() => {
    if (isEditing || !values.arabicText.trim()) return null;
    return pool.find(
      (e) => e.normalizedText === normalized && e.id !== initialValues?.id,
    );
  }, [values.arabicText, isEditing, initialValues, normalized, pool]);

  const similar = useMemo(() => {
    if (isEditing || !values.arabicText.trim()) return [];
    const needle = normalized.replace(/[إأآ]/g, "ا");
    return pool
      .filter((e) => e.normalizedText.includes(needle) && e.normalizedText !== initialValues?.normalizedText);
  }, [values.arabicText, isEditing, initialValues, normalized, pool]);

  const showDuplicateWarning =
    Boolean(exactDuplicate) || (similar.length > 0 && !acknowledgedDuplicate);

  function update<K extends keyof EntityFormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key === "arabicText") setAcknowledgedDuplicate(false);
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      setValues(startingValues);
      setAcknowledgedDuplicate(false);
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Arabic entity" : "Create Arabic entity"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the canonical Arabic text and its translations."
              : "This becomes the reusable canonical source for a Word or Sentence."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="arabic-text">Arabic text</Label>
            <Input
              id="arabic-text"
              dir="rtl"
              lang="ar"
              value={values.arabicText}
              onChange={(e) => update("arabicText", e.target.value)}
              placeholder="مرحبا"
              className="font-arabic text-lg"
            />
          </div>

          {exactDuplicate ? (
            <div className="rounded-default border border-danger-text/25 bg-danger-bg p-3.5">
              <div className="flex gap-2 text-sm font-medium text-danger-text">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                Duplicate Arabic entity detected (normalizedText must be unique)
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                An entity with normalized text <strong>&quot;{normalized}&quot;</strong> already exists. Duplicate entities with the same normalized text cannot be created.
              </p>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-sm bg-white px-3 py-2 border border-border/50">
                <div>
                  <p dir="rtl" lang="ar" className="font-arabic text-base text-text">
                    {exactDuplicate.arabicText}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {exactDuplicate.entityKey} · {exactDuplicate.meaningEnglish}
                  </p>
                  <RelationshipSummary entity={exactDuplicate} />
                </div>
                <Button size="sm" variant="secondary" onClick={() => onUseExisting(exactDuplicate)}>
                  Use this entity
                </Button>
              </div>
            </div>
          ) : showDuplicateWarning ? (
            <div className="rounded-default border border-warning-text/25 bg-warning-bg p-3.5">
              <div className="flex gap-2 text-sm font-medium text-warning-text">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                Possible existing entity found
              </div>
              <ul className="mt-2 flex flex-col gap-2">
                {similar.map((entity) => (
                  <li
                    key={entity.id}
                    className="flex items-center justify-between gap-3 rounded-sm bg-white px-3 py-2"
                  >
                    <div>
                      <p dir="rtl" lang="ar" className="font-arabic text-base text-text">
                        {entity.arabicText}
                      </p>
                      <p className="text-xs text-text-secondary">{entity.meaningEnglish}</p>
                      <RelationshipSummary entity={entity} />
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => onUseExisting(entity)}>
                      Use this entity
                    </Button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setAcknowledgedDuplicate(true)}
                className="mt-2 text-xs font-medium text-warning-text underline underline-offset-2"
              >
                None of these match — continue creating
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="meaning-en">Meaning (English)</Label>
                  <Input
                    id="meaning-en"
                    value={values.meaningEnglish}
                    onChange={(e) => update("meaningEnglish", e.target.value)}
                    placeholder="Hello / Welcome"
                  />
                </div>
                <div>
                  <Label htmlFor="meaning-bn">Meaning (Bangla)</Label>
                  <Input
                    id="meaning-bn"
                    value={values.meaningBangla}
                    onChange={(e) => update("meaningBangla", e.target.value)}
                    placeholder="হ্যালো / স্বাগতম"
                    className="font-bengali"
                  />
                </div>
                <div>
                  <Label htmlFor="pron-en">Pronunciation (English)</Label>
                  <Input
                    id="pron-en"
                    value={values.pronunciationEnglish}
                    onChange={(e) => update("pronunciationEnglish", e.target.value)}
                    placeholder="Marhaban"
                  />
                </div>
                <div>
                  <Label htmlFor="pron-bn">Pronunciation (Bangla)</Label>
                  <Input
                    id="pron-bn"
                    value={values.pronunciationBangla}
                    onChange={(e) => update("pronunciationBangla", e.target.value)}
                    placeholder="মারহাবান"
                    className="font-bengali"
                  />
                </div>
              </div>

              {/* Audio Management (Edit mode has entityId; Create mode requires saving first) */}
              {isEditing && initialValues ? (
                <div className="border-t border-border pt-4">
                  <EntityAudioPanel
                    entityId={initialValues.id}
                    entityLabel={initialValues.arabicText}
                    canEdit={checkAudioPermission(role, initialValues.status).canEdit}
                    disabledReason={checkAudioPermission(role, initialValues.status).disabledReason}
                  />
                </div>
              ) : (
                <div className="rounded-default bg-neutral-bg/70 p-3 text-xs text-text-muted leading-relaxed">
                  💡 <strong>Audio recording:</strong> অডিও যোগ করার জন্য প্রথমে Entity-টি সেভ করুন। সেভ করার পর Detail পেজ বা Edit মোড থেকে উচ্চারণ অডিও যোগ করা যাবে। (Audio recording can be attached after creating the entity).
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="ghost" onClick={() => handleClose(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={
                    !values.arabicText.trim() ||
                    !values.meaningEnglish.trim() ||
                    Boolean(exactDuplicate)
                  }
                  onClick={() => {
                    onSaveDraft(values);
                    handleClose(false);
                  }}
                >
                  Save draft
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
