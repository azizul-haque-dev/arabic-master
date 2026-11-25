"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  generateArabicEntityAction,
  generateArabicEntityListAction,
  type ArabicEntityGenerationBatchResult,
  type ArabicEntityGenerationResult,
} from "@/actions/content/arabic-entity-actions";
import { cn } from "@/lib/utils";

export function ArabicEntityGenerationDialog({
  open,
  onOpenChange,
  onGenerated,
  onBatchGenerated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (result: ArabicEntityGenerationResult) => void;
  onBatchGenerated: (results: ArabicEntityGenerationBatchResult[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingAction, setGeneratingAction] = useState<"single" | "list" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const queries = query
    .split(/[\n,،]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  async function handleGenerateOne() {
    if (isGenerating || !query.trim()) return;
    setIsGenerating(true);
    setGeneratingAction("single");
    setError(null);
    try {
      const result = await generateArabicEntityAction(query.trim());
      if (!result.success) {
        setError(result.error);
        return;
      }
      setQuery("");
      onOpenChange(false);
      onGenerated(result.data);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to generate Arabic entity.",
      );
    } finally {
      setIsGenerating(false);
      setGeneratingAction(null);
    }
  }

  async function handleGenerateList() {
    if (queries.length === 0) {
      setError("Please enter at least one Arabic word or phrase.");
      return;
    }
    if (queries.length > 25) {
      setError("You can generate up to 25 Arabic entities in a single batch.");
      return;
    }

    setIsGenerating(true);
    setGeneratingAction("list");
    setError(null);
    try {
      const result = await generateArabicEntityListAction(queries);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setQuery("");
      onOpenChange(false);
      onBatchGenerated(result.data);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to generate the Arabic entity list.",
      );
    } finally {
      setIsGenerating(false);
      setGeneratingAction(null);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => !isGenerating && onOpenChange(nextOpen)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Arabic entity with AI</DialogTitle>
          <DialogDescription>
            Enter Arabic text only. Generate one entity or a batch (one per line or comma-separated); no extra context or translation is used.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="arabic-entity-ai-query" className="mb-0">
              Arabic text
            </Label>
            {queries.length > 1 ? (
              <span
                className={cn(
                  "text-xs font-medium",
                  queries.length > 25 ? "text-error-text" : "text-text-muted",
                )}
              >
                {queries.length} / 25 entities detected
              </span>
            ) : null}
          </div>
          <Textarea
            id="arabic-entity-ai-query"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setError(null);
            }}
            rows={5}
            placeholder={"Enter a word or phrase:\nمرحبا\nشكرا"}
          />
          {error ? (
            <p role="alert" className="text-sm text-error-text">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              disabled={isGenerating}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              disabled={!query.trim() || isGenerating}
              onClick={() => void handleGenerateList()}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {isGenerating && generatingAction === "list"
                ? "Generating…"
                : `Generate List${queries.length > 1 ? ` (${queries.length})` : ""}`}
            </Button>
            <Button
              disabled={!query.trim() || isGenerating}
              onClick={() => void handleGenerateOne()}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {isGenerating && generatingAction === "single"
                ? "Generating…"
                : "Generate One"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
