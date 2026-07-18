import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import {
  BookOpen,
  Loader2,
  MessageSquareText,
  Send,
  Sparkles,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { generateAiContent, type AiContentType } from "./api";

const modeCopy: Record<
  AiContentType,
  { title: string; hint: string; example: string }
> = {
  word: {
    title: "Create a word entry",
    hint: "Enter one Arabic word or a short Saudi expression.",
    example: "e.g. شلونك",
  },
  sentence: {
    title: "Create a sentence entry",
    hint: "Enter an Arabic sentence to enrich and add to your library.",
    example: "e.g. وين أقرب مطعم؟",
  },
};

export function AiPage() {
  const [mode, setMode] = useState<AiContentType>("word");
  const [text, setText] = useState("");
  const copy = modeCopy[mode];

  const generateMutation = useMutation({
    mutationFn: () => generateAiContent(mode, text.trim()),
    onSuccess: () => {
      toast.success(
        `${mode === "word" ? "Word" : "Sentence"} generated and saved as a draft`,
      );
      setText("");
    },
    onError: () => toast.error("Generation failed. Please try again."),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim()) return;
    generateMutation.mutate();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-3">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent shadow-sm">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          AI content studio
        </h1>
        <p className="mt-2 text-sm text-muted">
          Create polished Saudi Arabic learning content in a few seconds.
        </p>
      </div>

      <Card className="overflow-hidden border-accent/15 shadow-md shadow-accent/5">
        <div className="border-b border-border bg-gradient-to-r from-accent-soft/80 via-surface to-surface p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Content type
          </p>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface/80 p-1.5 shadow-sm ring-1 ring-border">
            {(
              [
                ["word", "Word", BookOpen],
                ["sentence", "Sentence", MessageSquareText],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${mode === value ? "bg-accent text-accent-foreground shadow-sm" : "text-muted hover:bg-background hover:text-ink"}`}
                aria-pressed={mode === value}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-5 sm:p-6">
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="ai-content"
                  className="text-sm font-semibold text-ink"
                >
                  {copy.title}
                </label>
                <span className="rounded-full bg-background px-2.5 py-1 text-xs text-muted">
                  Arabic input
                </span>
              </div>
              <Textarea
                id="ai-content"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={copy.example}
                className="min-h-36 resize-y rounded-xl p-4 text-base leading-relaxed"
                dir="auto"
                disabled={generateMutation.isPending}
              />
              <p className="mt-2 text-xs text-muted">{copy.hint}</p>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={!text.trim() || generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {generateMutation.isPending
                  ? "Generating…"
                  : `Generate ${mode === "word" ? "word" : "sentence"}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
