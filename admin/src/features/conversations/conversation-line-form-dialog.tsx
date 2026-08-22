import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { ConversationLine } from "@/types/conversation";
import { SentenceSearchCombobox } from "./sentence-search-combobox";

// Mirrors the backend's XOR rule: exactly one of sentenceId / text.
const lineSchema = z
  .object({
    mode: z.enum(["search", "generate"]),
    speaker: z.string().trim().min(1, "Speaker is required").max(50),
    sentenceId: z.string().optional(),
    text: z.string().trim().optional(),
    meaningEn: z.string().trim().optional(),
    meaningBn: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "search" && !data.sentenceId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose a sentence",
        path: ["sentenceId"],
      });
    }
    if (data.mode === "generate" && !data.text) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter the line's text",
        path: ["text"],
      });
    }
  });

export type LineValues = z.infer<typeof lineSchema>;

interface ConversationLineFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: LineValues) => void;
  isSaving: boolean;
  line?: ConversationLine | null;
  // Speakers already used in this conversation, offered as quick picks.
  knownSpeakers?: string[];
}

export function ConversationLineFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSaving,
  line,
  knownSpeakers = [],
}: ConversationLineFormDialogProps) {
  const isEditing = Boolean(line);

  const form = useForm<LineValues>({
    resolver: zodResolver(lineSchema),
    defaultValues: {
      mode: "search",
      speaker: "",
      sentenceId: "",
      text: "",
      meaningEn: "",
      meaningBn: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        mode: "search",
        speaker: line?.speaker ?? knownSpeakers[0] ?? "",
        sentenceId: line?.sentenceId ?? "",
        text: "",
        meaningEn: line?.meaningEn ?? "",
        meaningBn: line?.meaningBn ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, line?.id]);

  const mode = form.watch("mode");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit line" : "Add line"}</DialogTitle>
          <DialogDescription>
            Pick the sentence spoken and who says it. Meanings are optional overrides
            for this specific exchange.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="speaker"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Speaker</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Ahmed, Speaker A" {...field} />
                  </FormControl>
                  {knownSpeakers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {knownSpeakers.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => form.setValue("speaker", s, { shouldValidate: true })}
                          className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted hover:bg-background hover:text-ink"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-1.5">
              <FormLabel>Sentence</FormLabel>
              <Controller
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <Tabs
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as "search" | "generate")}
                  >
                    <TabsList>
                      <TabsTrigger value="search">Pick existing</TabsTrigger>
                      <TabsTrigger value="generate">Type new</TabsTrigger>
                    </TabsList>

                    <TabsContent value="search">
                      <Controller
                        control={form.control}
                        name="sentenceId"
                        render={({ field: sentenceField }) => (
                          <SentenceSearchCombobox
                            value={sentenceField.value ?? ""}
                            onChange={(id) => sentenceField.onChange(id)}
                            initialLabel={
                              isEditing ? line?.sentence?.arabic.text : undefined
                            }
                          />
                        )}
                      />
                      {form.formState.errors.sentenceId && (
                        <p className="mt-1 text-xs font-medium text-destructive">
                          {form.formState.errors.sentenceId.message}
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="generate">
                      <Controller
                        control={form.control}
                        name="text"
                        render={({ field: textField }) => (
                          <Textarea
                            placeholder="e.g. أين أقرب مطعم؟ — or type in English/Bangla, it'll be translated"
                            className="arabic-text"
                            dir="auto"
                            rows={2}
                            {...textField}
                          />
                        )}
                      />
                      <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                        Matches an existing sentence with this text, or creates a new
                        one and lets AI fill in pronunciation, meaning and words.
                      </p>
                      {form.formState.errors.text && (
                        <p className="mt-1 text-xs font-medium text-destructive">
                          {form.formState.errors.text.message}
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="meaningEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meaning override (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="meaningBn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meaning override (Bangla)</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? mode === "generate"
                    ? "Generating…"
                    : "Saving…"
                  : "Save line"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}