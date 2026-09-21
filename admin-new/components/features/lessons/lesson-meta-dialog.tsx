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
import { mockSections } from "@/lib/mock-data/sections";
import { mockCourses } from "@/lib/mock-data/courses";
import type { Lesson, LessonMetaFormValues } from "@/lib/types/content";

function courseTitleFor(sectionId: string) {
    const section = mockSections.find((s) => s.id === sectionId);
    if (!section) return "";
    return mockCourses.find((c) => c.id === section.courseId)?.title ?? "";
}

const emptyValues: LessonMetaFormValues = {
    title: "",
    sectionId: mockSections[0]?.id ?? "",
    maxItemsRecommended: 10,
};

export function LessonMetaDialog({
    open,
    onOpenChange,
    initialLesson,
    onSave,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialLesson?: Lesson;
    onSave: (values: LessonMetaFormValues) => void;
}) {
    const isEditing = Boolean(initialLesson);
    const starting = initialLesson
        ? {
            title: initialLesson.title,
            sectionId: initialLesson.sectionId,
            maxItemsRecommended: initialLesson.maxItemsRecommended,
        }
        : emptyValues;
    const [values, setValues] = useState<LessonMetaFormValues>(starting);

    function update<K extends keyof LessonMetaFormValues>(key: K, value: LessonMetaFormValues[K]) {
        setValues((prev) => ({ ...prev, [key]: value }));
    }

    function handleClose(nextOpen: boolean) {
        if (!nextOpen) setValues(starting);
        onOpenChange(nextOpen);
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit lesson details" : "Create lesson"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the title, placement, and recommended size."
                            : "Start with the basics — you'll add words, sentences, and conversations next."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="l-title">Title</Label>
                        <Input
                            id="l-title"
                            value={values.title}
                            onChange={(e) => update("title", e.target.value)}
                            placeholder="Shopping Basics — Lesson 1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="l-section">Section</Label>
                        <select
                            id="l-section"
                            value={values.sectionId}
                            onChange={(e) => update("sectionId", e.target.value)}
                            className="h-11 w-full rounded-[var(--radius-default)] border border-[var(--color-border-strong)] bg-white px-3 text-sm focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/10"
                        >
                            {mockSections.length === 0 ? (
                                <option value="">No sections yet — create one first</option>
                            ) : (
                                mockSections.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {courseTitleFor(s.id)} → {s.title}
                                    </option>
                                ))
                            )}
                        </select>
                        <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                            No matching section? Create it from the Sections screen first.
                        </p>
                    </div>
                    <div>
                        <Label htmlFor="l-max">Recommended max items per type</Label>
                        <Input
                            id="l-max"
                            type="number"
                            min={1}
                            value={values.maxItemsRecommended}
                            onChange={(e) => update("maxItemsRecommended", Number(e.target.value) || 1)}
                        />
                        <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                            A guideline, not a hard limit — content creators can go over it.
                        </p>
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button variant="ghost" onClick={() => handleClose(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            disabled={!values.title.trim() || !values.sectionId}
                            onClick={() => {
                                onSave(values);
                                handleClose(false);
                            }}
                        >
                            {isEditing ? "Save changes" : "Create lesson"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}