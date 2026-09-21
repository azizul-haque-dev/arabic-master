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
import { mockCourses } from "@/lib/mock-data/courses";
import type { Section, SectionFormValues } from "@/lib/types/content";

export function SectionFormDialog({
    open,
    onOpenChange,
    initialSection,
    /** Preset when opened from a Course detail page — hides the course picker. */
    fixedCourseId,
    onSave,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialSection?: Section;
    fixedCourseId?: string;
    onSave: (values: SectionFormValues) => void;
}) {
    const isEditing = Boolean(initialSection);
    const starting: SectionFormValues = initialSection
        ? { title: initialSection.title, description: initialSection.description, courseId: initialSection.courseId }
        : { title: "", description: "", courseId: fixedCourseId ?? mockCourses[0]?.id ?? "" };
    const [values, setValues] = useState<SectionFormValues>(starting);

    function update<K extends keyof SectionFormValues>(key: K, value: SectionFormValues[K]) {
        setValues((prev) => ({ ...prev, [key]: value }));
    }

    function handleClose(nextOpen: boolean) {
        if (!nextOpen) setValues(starting);
        onOpenChange(nextOpen);
    }

    const courseLocked = isEditing || Boolean(fixedCourseId);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit section" : "Create section"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update the section details." : "Lessons are added after the section exists."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="sec-course">Course</Label>
                        <select
                            id="sec-course"
                            value={values.courseId}
                            disabled={courseLocked}
                            onChange={(e) => update("courseId", e.target.value)}
                            className="h-11 w-full rounded-[var(--radius-default)] border border-[var(--color-border-strong)] bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/10"
                        >
                            {mockCourses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="sec-title">Title</Label>
                        <Input
                            id="sec-title"
                            value={values.title}
                            onChange={(e) => update("title", e.target.value)}
                            placeholder="Shopping"
                        />
                    </div>
                    <div>
                        <Label htmlFor="sec-desc">Description</Label>
                        <Input
                            id="sec-desc"
                            value={values.description}
                            onChange={(e) => update("description", e.target.value)}
                            placeholder="Words for prices, bargaining, and buying things."
                        />
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button variant="ghost" onClick={() => handleClose(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            disabled={!values.title.trim() || !values.courseId}
                            onClick={() => {
                                onSave(values);
                                handleClose(false);
                            }}
                        >
                            {isEditing ? "Save changes" : "Create section"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}