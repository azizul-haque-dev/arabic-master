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
import type { Course, CourseFormValues, CourseType, DifficultyLevel } from "@/lib/types/content";
import { DIFFICULTY_LABEL } from "@/lib/types/content";

const emptyValues: CourseFormValues = {
  title: "",
  description: "",
  level: "BEGINNER",
  courseType: "FREE",
};

export function CourseFormDialog({
  open,
  onOpenChange,
  initialCourse,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCourse?: Course;
  onSave: (values: CourseFormValues) => Promise<void> | void;
}) {
  const isEditing = Boolean(initialCourse);
  const starting = initialCourse
    ? {
        title: initialCourse.title,
        description: initialCourse.description,
        level: initialCourse.level,
        courseType: initialCourse.courseType,
      }
    : emptyValues;

  const [values, setValues] = useState<CourseFormValues>(starting);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(
        initialCourse
          ? {
              title: initialCourse.title,
              description: initialCourse.description,
              level: initialCourse.level,
              courseType: initialCourse.courseType,
            }
          : emptyValues,
      );
      setFormError(null);
      setIsSubmitting(false);
    }
  }, [open, initialCourse]);

  function update<K extends keyof CourseFormValues>(key: K, value: CourseFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!values.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!values.description.trim()) {
      setFormError("Description is required.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await onSave(values);
      onOpenChange(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save course.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit course" : "Create course"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the course title, description, level, and access type."
              : "Sections and lessons are added after the course exists."}
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
            <Label htmlFor="crs-title">Title</Label>
            <Input
              id="crs-title"
              value={values.title}
              disabled={isSubmitting}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Free Words"
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="crs-desc">Description</Label>
            <Textarea
              id="crs-desc"
              value={values.description}
              disabled={isSubmitting}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Core vocabulary for daily life, shopping, and travel."
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="crs-level">Level</Label>
              <select
                id="crs-level"
                value={values.level}
                disabled={isSubmitting}
                onChange={(e) => update("level", e.target.value as DifficultyLevel)}
                className="h-11 w-full rounded-[var(--radius-default)] border border-[var(--color-border-strong)] bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/10"
              >
                {Object.entries(DIFFICULTY_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="crs-type">Access</Label>
              <select
                id="crs-type"
                value={values.courseType}
                disabled={isSubmitting}
                onChange={(e) => update("courseType", e.target.value as CourseType)}
                className="h-11 w-full rounded-[var(--radius-default)] border border-[var(--color-border-strong)] bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/10"
              >
                <option value="FREE">Free</option>
                <option value="PRO">Pro</option>
              </select>
            </div>
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
              disabled={!values.title.trim() || !values.description.trim() || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Save changes"
                : "Create course"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
