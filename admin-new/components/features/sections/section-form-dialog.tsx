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
import type { Section, SectionFormValues } from "@/lib/types/content";
import type { CourseOption } from "@/lib/sections/api";

export function SectionFormDialog({
  open,
  onOpenChange,
  initialSection,
  /** Preset when opened from a Course detail page — locks the course picker. */
  fixedCourseId,
  courseOptions = [],
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSection?: Section;
  fixedCourseId?: string;
  courseOptions?: CourseOption[];
  onSave: (values: SectionFormValues) => Promise<void> | void;
}) {
  const isEditing = Boolean(initialSection);

  const defaultCourseId =
    fixedCourseId ??
    initialSection?.courseId ??
    courseOptions[0]?.id ??
    "";

  const [values, setValues] = useState<SectionFormValues>({
    title: initialSection?.title ?? "",
    description: initialSection?.description ?? "",
    courseId: defaultCourseId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues({
        title: initialSection?.title ?? "",
        description: initialSection?.description ?? "",
        courseId:
          fixedCourseId ??
          initialSection?.courseId ??
          courseOptions[0]?.id ??
          "",
      });
      setFormError(null);
      setIsSubmitting(false);
    }
  }, [open, initialSection, fixedCourseId, courseOptions]);

  function update<K extends keyof SectionFormValues>(key: K, value: SectionFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!values.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!values.courseId) {
      setFormError("Please select a course for this section.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await onSave(values);
      onOpenChange(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save section.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const courseLocked = isEditing || Boolean(fixedCourseId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit section" : "Create section"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the section title and description."
              : "Create a section under a course. Lessons are added after the section exists."}
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
            <Label htmlFor="sec-course">Course</Label>
            <select
              id="sec-course"
              value={values.courseId}
              disabled={courseLocked || isSubmitting}
              onChange={(e) => update("courseId", e.target.value)}
              className="h-11 w-full rounded-[var(--radius-default)] border border-[var(--color-border-strong)] bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/10"
            >
              {courseOptions.length === 0 ? (
                <option value="">No courses available</option>
              ) : (
                courseOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.courseKey})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <Label htmlFor="sec-title">Title</Label>
            <Input
              id="sec-title"
              value={values.title}
              disabled={isSubmitting}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Shopping"
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="sec-desc">Description</Label>
            <Textarea
              id="sec-desc"
              value={values.description}
              disabled={isSubmitting}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Words for prices, bargaining, and buying things."
              maxLength={1000}
              rows={3}
            />
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
              disabled={!values.title.trim() || !values.courseId || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Save changes"
                : "Create section"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
