"use client";

import { useState } from "react";
import { Type, MessageSquareText, MessageSquareQuote, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generateWordAction, regenerateWordAction } from "@/actions/content/word-actions";
import {
  generateSentenceAction,
  regenerateSentenceAction,
  resyncSentenceWordsAction,
} from "@/actions/content/sentence-actions";
import type { ArabicEntity } from "@/lib/types/content";
import { cn } from "@/lib/utils";

export type EntityAiTargetType = "WORD" | "SENTENCE" | "SHORT_SENTENCE";

export interface EntityAiQueuedResult {
  targetType: EntityAiTargetType;
  targetId: string;
  targetKey: string;
  targetLabel: string;
  href: string;
}

const TARGET_OPTIONS: {
  value: EntityAiTargetType;
  label: string;
  description: string;
  icon: typeof Type;
}[] = [
  {
    value: "WORD",
    label: "Word",
    description: "Generate vocabulary word meaning, pronunciation, and usage.",
    icon: Type,
  },
  {
    value: "SENTENCE",
    label: "Sentence",
    description: "Generate a full spoken sentence (Long sentence) with AI.",
    icon: MessageSquareText,
  },
  {
    value: "SHORT_SENTENCE",
    label: "Short Sentence",
    description: "Generate a quick, bite-sized conversational phrase (Short sentence).",
    icon: MessageSquareQuote,
  },
];

export function EntityAiDialog({
  open,
  onOpenChange,
  entity,
  onQueued,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: ArabicEntity;
  onQueued: (result: EntityAiQueuedResult) => void;
}) {
  const [target, setTarget] = useState<EntityAiTargetType>("WORD");
  const [linkWords, setLinkWords] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      if (target === "WORD") {
        const res = await generateWordAction(entity.arabicText);
        if (!res.success) {
          setError(res.error);
          return;
        }
        const word = res.data;
        if (word.meaningEnglish.trim() && word.meaningBangla.trim()) {
          await regenerateWordAction(word.id);
        }
        onOpenChange(false);
        onQueued({
          targetType: "WORD",
          targetId: word.id,
          targetKey: word.wordKey,
          targetLabel: "Word",
          href: `/admin/words/${encodeURIComponent(word.id)}`,
        });
        return;
      }

      const sentenceType = target === "SHORT_SENTENCE" ? "SHORT" : "LONG";
      const res = await generateSentenceAction({
        query: entity.arabicText,
        sentenceType,
        linkWords,
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      const sentence = res.data;
      if (sentence.meaningEnglish.trim() && sentence.meaningBangla.trim()) {
        await regenerateSentenceAction(sentence.id);
        if (linkWords) {
          await resyncSentenceWordsAction(sentence.id);
        }
      }
      onOpenChange(false);
      onQueued({
        targetType: target,
        targetId: sentence.id,
        targetKey: sentence.sentenceKey,
        targetLabel: target === "SHORT_SENTENCE" ? "Short Sentence" : "Sentence",
        href: `/admin/sentences/${encodeURIComponent(sentence.id)}`,
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to queue AI generation.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isGenerating && onOpenChange(nextOpen)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate with AI</DialogTitle>
          <DialogDescription>
            Choose what type of content you want AI to generate for this Arabic Entity.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="rounded-default border border-border bg-neutral-bg/60 px-3.5 py-2.5">
            <p dir="rtl" lang="ar" className="font-arabic text-2xl leading-relaxed text-text">
              {entity.arabicText}
            </p>
            <p className="text-xs text-text-muted">Entity · {entity.entityKey}</p>
          </div>

          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Content type to generate">
            {TARGET_OPTIONS.map((option) => {
              const Icon = option.icon;
              const selected = target === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={isGenerating}
                  onClick={() => {
                    setTarget(option.value);
                    setError(null);
                  }}
                  className={cn(
                    "flex items-start gap-3 rounded-default border p-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary-light/15 text-text"
                      : "border-border bg-white text-text-secondary hover:border-border-strong",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                      selected
                        ? "bg-primary text-white"
                        : "bg-neutral-bg text-text-muted",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-text">
                      {option.label}
                    </span>
                    <span className="text-xs text-text-muted">
                      {option.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {target === "SENTENCE" || target === "SHORT_SENTENCE" ? (
            <label className="flex cursor-pointer items-center gap-2 rounded-default border border-border bg-neutral-bg/50 px-3 py-2 text-xs text-text-secondary">
              <input
                type="checkbox"
                checked={linkWords}
                onChange={(event) => setLinkWords(event.target.checked)}
                className="h-4 w-4 rounded border-border-strong text-primary focus:ring-primary"
              />
              <span>
                Link words automatically for this{" "}
                {target === "SHORT_SENTENCE" ? "short sentence" : "sentence"}
              </span>
            </label>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm text-error-text">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              disabled={isGenerating}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={isGenerating}
              onClick={() => void handleGenerate()}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {isGenerating ? "Queueing…" : "Generate"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
