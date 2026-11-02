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
import { Textarea } from "@/components/ui/textarea";
import type { Lesson, LessonMetaFormValues } from "@/lib/types/content";
import type { SectionOption } from "@/lib/lessons/api";
import { cn } from "@/lib/utils";

export const LESSON_TITLE_OPTIONS = [
  "Basics – Lesson 1",
  "Basics – Lesson 2",
  "Intermediate – Lesson 1",
  "Intermediate – Lesson 2",
  "Advanced - Lesson 1",
] as const;

export function LessonMetaDialog({
  open,
  onOpenChange,
  initialLesson,
  sectionOptions = [],
  defaultSectionId,
  fixedSectionId,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLesson?: Lesson;
  sectionOptions?: SectionOption[];
  defaultSectionId?: string;
  fixedSectionId?: string;
  onSave: (values: LessonMetaFormValues) => Promise<void> | void;
}) {
  const isEditing = Boolean(initialLesson);

  const initialSection =
    fixedSectionId ??
    defaultSectionId ??
    initialLesson?.sectionId ??
    sectionOptions[0]?.id ??
    "";

  const [values, setValues] = useState<LessonMetaFormValues>({
    title: initialLesson?.title ?? LESSON_TITLE_OPTIONS[0],
    description: initialLesson?.description ?? "",
    sectionId: initialSection,
    maxItemsRecommended: initialLesson?.maxItemsRecommended ?? 10,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues({
        title: initialLesson?.title ?? LESSON_TITLE_OPTIONS[0],
        description: initialLesson?.description ?? "",
        sectionId:
          fixedSectionId ??
          defaultSectionId ??
          initialLesson?.sectionId ??
          sectionOptions[0]?.id ??
          "",
        maxItemsRecommended: initialLesson?.maxItemsRecommended ?? 10,
      });
      setFormError(null);
      setIsSubmitting(false);
    }
  }, [open, initialLesson, sectionOptions, defaultSectionId, fixedSectionId]);

  function update<K extends keyof LessonMetaFormValues>(key: K, value: LessonMetaFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!values.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    const finalSectionId = values.sectionId || sectionOptions[0]?.id || "";
    if (!finalSectionId) {
      setFormError("Please select a section for this lesson. Create a section first if none exists.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await onSave({
        ...values,
        sectionId: finalSectionId,
        title: values.title.trim(),
        description: values.description?.trim() ?? "",
      });
      onOpenChange(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save lesson.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit lesson details" : "Create lesson"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the lesson title, description, and recommended item size."
              : "Start with the basics — you'll add words, sentences, and conversations next."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {formError ? (
            <div
              role="alert"
              className="rounded-[var(--radius-default)] border border-[var(--color-error)]/20 bg-[var(--color-error-bg)] p-3 text-xs text-[var(--color-error-text)]"
            >
              {formError}
            </div>
          ) : null}

          <div>
            <div className="mb-1 flex items-center justify-between">
              <Label htmlFor="l-title" className="mb-0">Title</Label>
              <span className="text-[11px] text-[var(--color-text-muted)]">Type or select a title</span>
            </div>
            <Input
              id="l-title"
              value={values.title}
              disabled={isSubmitting}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Lesson 1: Greetings or Basics – Lesson 1"
              maxLength={200}
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {LESSON_TITLE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => update("title", opt)}
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
                    values.title === opt
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/20 text-[var(--color-primary)]"
                      : "border-[var(--color-border)] bg-[var(--color-neutral-bg)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]",
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="l-desc">Description</Label>
            <Textarea
              id="l-desc"
              value={values.description ?? ""}
              disabled={isSubmitting}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Introductory words and phrases for shopping."
              maxLength={1000}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="l-section">Section</Label>
            <select
              id="l-section"
              value={values.sectionId}
              disabled={Boolean(fixedSectionId) || isEditing || isSubmitting}
              onChange={(e) => update("sectionId", e.target.value)}
              className="h-11 w-full rounded-[var(--radius-default)] border border-[var(--color-border-strong)] bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/10"
            >
              {sectionOptions.length === 0 ? (
                <option value="">No sections available — create one first</option>
              ) : (
                sectionOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.courseTitle ? `${s.courseTitle} → ` : ""}
                    {s.title} ({s.sectionKey})
                  </option>
                ))
              )}
            </select>
            {fixedSectionId ? (
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                Creating lesson directly in this section.
              </p>
            ) : isEditing ? (
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                Section cannot be changed once a lesson is created.
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                No matching section? Create it from the Sections screen first.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="l-max">Recommended max items per type</Label>
            <Input
              id="l-max"
              type="number"
              min={1}
              max={50}
              disabled={isSubmitting}
              value={values.maxItemsRecommended ?? 10}
              onChange={(e) => update("maxItemsRecommended", Number(e.target.value) || 1)}
            />
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
              A guideline, not a hard limit — content creators can go over it.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!values.title.trim() || !values.sectionId || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Save changes"
                : "Create lesson"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
