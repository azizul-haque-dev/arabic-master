"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { LessonContentItem } from "@/lib/types/content";

export function LessonContentPanel({
    items,
    maxRecommended,
    addLabel,
    pickerTitle,
    pickerDescription,
    renderPicker,
    renderPreview,
    onAdd,
    onRemove,
    onReorder,
}: {
    /** Already filtered to a single content type and sorted by `order`. */
    items: LessonContentItem[];
    maxRecommended: number;
    addLabel: string;
    pickerTitle: string;
    pickerDescription: string;
    renderPicker: (onPick: (contentId: string) => void) => React.ReactNode;
    renderPreview: (contentId: string) => React.ReactNode;
    onAdd: (contentId: string) => void;
    onRemove: (itemId: string) => void;
    onReorder: (reordered: LessonContentItem[]) => void;
}) {
    const [addOpen, setAddOpen] = useState(false);

    function moveItem(index: number, direction: -1 | 1) {
        const target = index + direction;
        if (target < 0 || target >= items.length) return;
        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        onReorder(next.map((it, i) => ({ ...it, order: i + 1 })));
    }

    const overRecommended = items.length > maxRecommended;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--color-text-muted)]">
                    {items.length} / {maxRecommended} recommended
                </p>
                {overRecommended ? (
                    <span className="rounded-full bg-[var(--color-warning-bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-warning-text)]">
                        Over the recommended count — still allowed
                    </span>
                ) : null}
            </div>

            {items.length === 0 ? (
                <div className="rounded-[var(--radius-default)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-neutral-bg)] px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                    Nothing added yet.
                </div>
            ) : (
                <ol className="flex flex-col gap-2">
                    {items.map((item, index) => (
                        <li
                            key={item.id}
                            className="flex items-center gap-3 rounded-[var(--radius-default)] border border-[var(--color-border)] bg-white p-3"
                        >
                            <span className="w-5 flex-shrink-0 text-center text-xs font-semibold text-[var(--color-text-muted)]">
                                {item.order}
                            </span>
                            <div className="flex-1">{renderPreview(item.contentId)}</div>
                            <div className="flex flex-shrink-0 gap-1">
                                <button
                                    type="button"
                                    onClick={() => moveItem(index, -1)}
                                    disabled={index === 0}
                                    aria-label="Move up"
                                    className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-neutral-bg)] disabled:opacity-30"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveItem(index, 1)}
                                    disabled={index === items.length - 1}
                                    aria-label="Move down"
                                    className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-neutral-bg)] disabled:opacity-30"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onRemove(item.id)}
                                    aria-label="Remove"
                                    className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:bg-[var(--color-error-bg)] hover:text-[var(--color-error-text)]"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ol>
            )}

            <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="flex items-center justify-center gap-2 rounded-[var(--radius-default)] border border-dashed border-[var(--color-border-strong)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-light)]/15"
            >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {addLabel}
            </button>

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{pickerTitle}</DialogTitle>
                        <DialogDescription>{pickerDescription}</DialogDescription>
                    </DialogHeader>
                    {renderPicker((contentId) => {
                        onAdd(contentId);
                        setAddOpen(false);
                    })}
                </DialogContent>
            </Dialog>
        </div>
    );
}