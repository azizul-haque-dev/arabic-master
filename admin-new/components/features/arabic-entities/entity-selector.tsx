"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { ContentSearch } from "@/components/shared/content-search";
import { RelationshipSummary } from "@/components/features/arabic-entities/relationship-summary";
import { EmptyState } from "@/components/shared/empty-state";
import { mockArabicEntities } from "@/lib/mock-data/arabic-entities";
import type { ArabicEntity } from "@/lib/types/content";
import { cn } from "@/lib/utils";

/**
 * Reusable across Word and Sentence editors.
 * Enforces the entity-first workflow from the CMS spec: search and reuse
 * an existing canonical Arabic Entity before offering to create a new one.
 */
export function EntitySelector({
  onSelect,
  onCreateNew,
  selectedEntityId,
}: {
  onSelect: (entity: ArabicEntity) => void;
  onCreateNew: (query: string) => void;
  selectedEntityId?: string;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return mockArabicEntities.slice(0, 5);
    const needle = query.trim();
    return mockArabicEntities.filter(
      (e) =>
        e.arabicText.includes(needle) ||
        e.meaningEnglish.toLowerCase().includes(needle.toLowerCase()) ||
        e.meaningBangla.includes(needle),
    );
  }, [query]);

  return (
    <div className="flex flex-col gap-3">
      <ContentSearch value={query} onChange={setQuery} placeholder="Search Arabic entities..." />

      {results.length > 0 ? (
        <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          {results.map((entity) => (
            <li key={entity.id}>
              <button
                type="button"
                onClick={() => onSelect(entity)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-default border px-3.5 py-2.5 text-left transition-colors",
                  selectedEntityId === entity.id
                    ? "border-primary bg-primary-light/15"
                    : "border-border hover:border-border-strong hover:bg-neutral-bg",
                )}
              >
                <div>
                  <p dir="rtl" lang="ar" className="font-arabic text-lg text-text">
                    {entity.arabicText}
                  </p>
                  <p className="text-xs text-text-secondary">{entity.meaningEnglish}</p>
                </div>
                <RelationshipSummary entity={entity} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Search}
          title="No matching Arabic entities found"
          description="Try a different search, or create a new entity below."
        />
      )}

      <button
        type="button"
        onClick={() => onCreateNew(query)}
        className="flex items-center justify-center gap-2 rounded-default border border-dashed border-border-strong px-3.5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary-light/15"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Create new entity
      </button>
    </div>
  );
}
