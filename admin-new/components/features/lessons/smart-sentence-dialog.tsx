"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { smartAddSentencesToLessonAction } from "@/actions/content/lesson-actions";
import type { Lesson } from "@/lib/types/content";
import { cn } from "@/lib/utils";

export function SmartSentenceDialog({
  open,
  onOpenChange,
  lessonId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
  onSuccess: (lesson: Lesson) => void;
}) {
  const [text, setText] = useState("");
  const [sentenceType, setSentenceType] = useState<"LONG" | "SHORT">("LONG");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    summary: { total: number; added: number; alreadyInLesson: number; failed: number };
    items: Array<{
      query: string;
      sentenceId?: string;
      sentenceKey?: string;
      status: "added" | "already_in_lesson" | "failed";
      createdViaAi?: boolean;
      error?: string;
    }>;
  } | null>(null);

  function handleClose(nextOpen: boolean) {
    if (!isLoading) {
      if (!nextOpen) {
        setText("");
        setError(null);
        setResults(null);
      }
      onOpenChange(nextOpen);
    }
  }

  async function handleSmartAdd() {
    const raw = text.trim();
    if (!raw) {
      setError("Please enter at least one sentence.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await smartAddSentencesToLessonAction(lessonId, raw, sentenceType);
      if (!res.success) {
        setError(res.error);
        return;
      }

      setResults({
        summary: res.data.summary,
        items: res.data.results,
      });

      onSuccess(res.data.lesson);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process sentences.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[var(--color-primary)]">
            <Sparkles className="h-5 w-5" />
            <DialogTitle>Smart Add Sentences with AI</DialogTitle>
          </div>
          <DialogDescription>
            Enter multiple sentences (one per line). If the sentence exists in the database, it will be linked instantly. If not, AI will automatically translate, generate, and save it!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {error ? (
            <div
              role="alert"
              className="rounded-[var(--radius-default)] border border-[var(--color-error)]/20 bg-[var(--color-error-bg)] p-3 text-xs text-[var(--color-error-text)]"
            >
              {error}
            </div>
          ) : null}

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="smart-sentences-type"
                className="text-xs font-medium text-[var(--color-text)]"
              >
                Sentence Format
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setSentenceType("LONG")}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                    sentenceType === "LONG"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/20 text-[var(--color-primary)]"
                      : "border-[var(--color-border)] bg-[var(--color-neutral-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
                  )}
                >
                  Standard Sentence
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setSentenceType("SHORT")}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                    sentenceType === "SHORT"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]/20 text-[var(--color-primary)]"
                      : "border-[var(--color-border)] bg-[var(--color-neutral-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
                  )}
                >
                  Short Sentence
                </button>
              </div>
            </div>

            <label
              htmlFor="smart-sentences-input"
              className="text-xs font-medium text-[var(--color-text)]"
            >
              Sentences (one per line)
            </label>
            <Textarea
              id="smart-sentences-input"
              value={text}
              disabled={isLoading}
              onChange={(e) => setText(e.target.value)}
              placeholder={"e.g.\nHow much does this cost?\nأنا أحب تعلم اللغة العربية\nSNT-1002"}
              rows={4}
              className="mt-1.5"
            />
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
              Accepts English, Bengali, or Arabic text, or Sentence Keys (e.g. SNT-1002).
            </p>
          </div>

          {results ? (
            <div className="rounded-[var(--radius-default)] border border-[var(--color-border)] bg-[var(--color-neutral-bg)] p-3 text-xs">
              <p className="font-semibold text-[var(--color-text)]">
                Processed {results.summary.total} sentence(s): {results.summary.added} added, {results.summary.alreadyInLesson} already in lesson, {results.summary.failed} failed.
              </p>
              <ul className="mt-2 flex max-h-36 flex-col gap-1 overflow-y-auto">
                {results.items.map((it, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-2 py-0.5">
                    <span className="font-medium text-[var(--color-text)] truncate max-w-[240px]">
                      {it.query}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] shrink-0">
                      {it.status === "added" ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success-text)]" />
                          <span className="text-[var(--color-success-text)]">
                            {it.createdViaAi ? "Generated & Added" : "Linked"}
                          </span>
                        </>
                      ) : it.status === "already_in_lesson" ? (
                        <>
                          <Info className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                          <span className="text-[var(--color-text-muted)]">Already in lesson</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3.5 w-3.5 text-[var(--color-error-text)]" />
                          <span className="text-[var(--color-error-text)]">{it.error || "Failed"}</span>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              disabled={isLoading}
              onClick={() => handleClose(false)}
            >
              {results ? "Close" : "Cancel"}
            </Button>
            <Button
              variant="primary"
              disabled={isLoading || !text.trim()}
              onClick={handleSmartAdd}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Processing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Add Sentences
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

