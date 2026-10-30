"use client";

import { ContentSearch } from "@/components/shared/content-search";
import { ContentStatusFilter } from "@/components/shared/content-filters";
import { SENTENCE_CATEGORIES } from "@/lib/sentences/categories";
import {
    SENTENCE_TYPE_LABEL,
    type ContentStatus,
    type SentenceType,
} from "@/lib/types/content";

const STATUS_OPTIONS: ContentStatus[] = [
    "DRAFT",
    "IN_REVIEW",
    "APPROVED",
    "PUBLISHED",
    "REJECTED",
    "ARCHIVED",
];

export function SentenceFilterBar({
    search,
    onSearchChange,
    statusFilter,
    onStatusChange,
    category,
    onCategoryChange,
    sentenceType,
    onSentenceTypeChange,
    hideTypeFilter = false,
    total,
    itemLabel = "sentences",
}: {
    search: string;
    onSearchChange: (value: string) => void;
    statusFilter: Set<ContentStatus>;
    onStatusChange: (value: Set<ContentStatus>) => void;
    category: string;
    onCategoryChange: (value: string) => void;
    sentenceType?: SentenceType | "";
    onSentenceTypeChange?: (value: SentenceType | "") => void;
    hideTypeFilter?: boolean;
    total: number;
    itemLabel?: string;
}) {
    const singularLabel = itemLabel.endsWith("s") ? itemLabel.slice(0, -1) : itemLabel;

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <ContentSearch
                    value={search}
                    onChange={onSearchChange}
                    placeholder="Search Arabic, English, Bangla..."
                />
                <ContentStatusFilter
                    selected={statusFilter}
                    onChange={onStatusChange}
                    options={STATUS_OPTIONS}
                    singleSelection
                />
                {!hideTypeFilter && onSentenceTypeChange ? (
                    <select
                        aria-label="Filter by sentence type"
                        value={sentenceType ?? ""}
                        onChange={(event) =>
                            onSentenceTypeChange(event.target.value as SentenceType | "")
                        }
                        className="h-9 rounded-default border border-border-strong bg-white px-3 text-sm text-text"
                    >
                        <option value="">All types</option>
                        {(Object.entries(SENTENCE_TYPE_LABEL) as [SentenceType, string][]).map(
                            ([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ),
                        )}
                    </select>
                ) : null}
                <select
                    aria-label="Filter by category"
                    value={category}
                    onChange={(event) => onCategoryChange(event.target.value)}
                    className="h-9 rounded-default border border-border-strong bg-white px-3 text-sm text-text"
                >
                    <option value="">All categories</option>
                    {SENTENCE_CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            </div>
            <p className="text-xs text-text-muted">
                {total} {total === 1 ? singularLabel : itemLabel}
            </p>
        </div>
    );
}

