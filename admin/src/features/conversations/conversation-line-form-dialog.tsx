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
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { ConversationLine } from "@/types/conversation";
import { SentenceSearchCombobox } from "./sentence-search-combobox";

const lineSchema = z.object({
  speaker: z.string().trim().min(1, "Speaker is required").max(50),
  sentenceId: z.string().min(1, "Choose a sentence"),
  meaningEn: z.string().trim().optional(),
  meaningBn: z.string().trim().optional(),
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
    defaultValues: { speaker: "", sentenceId: "", meaningEn: "", meaningBn: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        speaker: line?.speaker ?? knownSpeakers[0] ?? "",
        sentenceId: line?.sentenceId ?? "",
        meaningEn: line?.meaningEn ?? "",
        meaningBn: line?.meaningBn ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, line?.id]);

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
                name="sentenceId"
                render={({ field }) => (
                  <SentenceSearchCombobox
                    value={field.value}
                    onChange={(id) => field.onChange(id)}
                    initialLabel={line?.sentence?.arabic.text}
                  />
                )}
              />
              {form.formState.errors.sentenceId && (
                <p className="text-xs font-medium text-destructive">
                  {form.formState.errors.sentenceId.message}
                </p>
              )}
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
                {isSaving ? "Saving…" : "Save line"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
