"use client";

import { useState } from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { getArabicEntityAction } from "@/actions/content/arabic-entity-actions";
import type { ArabicEntity } from "@/lib/types/content";

export function RelationshipSummary({ entity }: { entity: ArabicEntity }) {
  const [linkedEntity, setLinkedEntity] = useState<ArabicEntity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const parts: string[] = [];

  if (entity.wordUsageCount > 0) {
    parts.push(`${entity.wordUsageCount} Word${entity.wordUsageCount > 1 ? "s" : ""}`);
  }
  if (entity.sentenceUsageCount > 0) {
    parts.push(`${entity.sentenceUsageCount} Sentence${entity.sentenceUsageCount > 1 ? "s" : ""}`);
  }

  if (parts.length === 0) {
    return <span className="text-xs text-text-muted">Not used yet</span>;
  }

  async function loadLinkedContent() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getArabicEntityAction(entity.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setLinkedEntity(result.data);
    } catch {
      setError("Unable to load linked content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DropdownMenu.Root
      onOpenChange={(open) => {
        if (open && !linkedEntity && !isLoading) void loadLinkedContent();
      }}
    >
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          className="text-left text-xs text-text-muted underline decoration-dotted underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Open linked Words and Sentences for ${entity.entityKey}`}
        >
          {parts.join(" · ")}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-50 max-h-96 w-80 overflow-y-auto rounded-md border border-border bg-white p-2 shadow-lg"
        >
          {isLoading ? (
            <p role="status" className="px-2 py-3 text-sm text-text-muted">
              Loading linked content…
            </p>
          ) : error ? (
            <div className="px-2 py-2">
              <p role="alert" className="text-sm text-error-text">{error}</p>
              <DropdownMenu.Item
                onSelect={(event) => {
                  event.preventDefault();
                  void loadLinkedContent();
                }}
                className="mt-2 cursor-pointer text-sm font-medium text-primary outline-none hover:underline"
              >
                Retry
              </DropdownMenu.Item>
            </div>
          ) : linkedEntity ? (
            <>
              <LinkedContentGroup
                label="Words"
                emptyLabel="No linked Words"
                items={linkedEntity.linkedWords?.map((word) => ({
                  id: word.id,
                  key: word.wordKey,
                  meaning: word.meaningEnglish,
                  href: `/admin/words/${encodeURIComponent(word.id)}`,
                })) ?? []}
              />
              <LinkedContentGroup
                label="Sentences"
                emptyLabel="No linked Sentences"
                items={linkedEntity.linkedSentences?.map((sentence) => ({
                  id: sentence.id,
                  key: sentence.sentenceKey,
                  meaning: sentence.meaningEnglish,
                  href: `/admin/sentences/${encodeURIComponent(sentence.id)}`,
                })) ?? []}
              />
            </>
          ) : null}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function LinkedContentGroup({
  label,
  emptyLabel,
  items,
}: {
  label: string;
  emptyLabel: string;
  items: { id: string; key: string; meaning: string; href: string }[];
}) {
  return (
    <section className="py-1">
      <h3 className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </h3>
      {items.length > 0 ? items.map((item) => (
        <DropdownMenu.Item key={item.id} asChild>
          <Link
            href={item.href}
            className="flex flex-col rounded-sm px-2 py-2 text-sm outline-none hover:bg-background focus:bg-background"
          >
            <span className="font-medium text-text">{item.key}</span>
            <span className="truncate text-xs text-text-muted">
              {item.meaning || "No English meaning"}
            </span>
          </Link>
        </DropdownMenu.Item>
      )) : (
        <p className="px-2 py-1 text-xs text-text-muted">{emptyLabel}</p>
      )}
    </section>
  );
}
