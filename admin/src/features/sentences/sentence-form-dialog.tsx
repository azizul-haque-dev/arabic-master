import { CategoryMultiSelect } from "@/components/category-multi-select";
import { StatusBadge } from "@/components/status-badge";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Sentence } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createSentence, updateSentence } from "./api";
import { WordPickerRows } from "./word-picker-rows";

const sentenceSchema = z.object({
  text: z.string().trim().min(1, "Arabic text is required"),
  audioUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  meaningEn: z.string().trim().optional(),
  meaningBn: z.string().trim().optional(),
  whenToUseEn: z.string().trim().optional(),
  whenToUseBn: z.string().trim().optional(),
  categoryIds: z.array(z.string()).default([]),
  // Optional now - the AI worker can populate words later, so a sentence
  // can be saved/queued with none up front.
  words: z
    .array(
      z.object({
        wordId: z.string().min(1, "Choose a word"),
        position: z.number().int().nonnegative(),
      }),
    )
    .default([])
    .superRefine((words, ctx) => {
      const ids = words.map((w) => w.wordId);
      const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
      if (duplicates.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Duplicate word in sentence",
        });
      }
    }),
});

export type SentenceValues = z.infer<typeof sentenceSchema>;

interface SentenceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sentence?: Sentence | null;
}

export function SentenceFormDialog({
  open,
  onOpenChange,
  sentence,
}: SentenceFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(sentence);

  const form = useForm<SentenceValues>({
    resolver: zodResolver(sentenceSchema),
    defaultValues: {
      text: "",
      meaningEn: "",
      meaningBn: "",
      categoryIds: [],
      words: [],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        text: sentence?.arabic.text ?? "",
        audioUrl: sentence?.arabic.audioUrl ?? "",
        meaningEn: sentence?.meaningEn ?? "",
        meaningBn: sentence?.meaningBn ?? "",
        whenToUseEn: sentence?.whenToUseEn ?? "",
        whenToUseBn: sentence?.whenToUseBn ?? "",
        categoryIds: sentence?.categories.map((c) => c.id) ?? [],
        words:
          sentence?.words
            .sort((a, b) => a.position - b.position)
            .map((w, i) => ({ wordId: w.id, position: i })) ?? [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sentence?.id]);

  const mutation = useMutation({
    mutationFn: (values: SentenceValues) => {
      const payload = {
        ...values,
        audioUrl: values.audioUrl || undefined,
        words: values.words.map((w, i) => ({ ...w, position: i })),
      };
      return isEditing
        ? updateSentence(sentence!.id, payload)
        : createSentence(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sentences"] });
      toast.success(isEditing ? "Sentence updated" : "Sentence created");
      onOpenChange(false);
    },
    onError: (err) => {
      const message =
        err instanceof AxiosError
          ? (err.response?.data?.message ?? "Something went wrong")
          : "Something went wrong";
      toast.error(message);
    },
  });

  // Pronunciation/feminine/status/aiStatus all live on ArabicText now and are
  // filled in by the AI worker - shown read-only here, never editable via
  // this form.
  const arabic = sentence?.arabic;
  const hasAiInfo =
    arabic &&
    (arabic.pronunciationEn ||
      arabic.pronunciationBn ||
      arabic.feminineEn ||
      arabic.feminineBn);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit sentence" : "New sentence"}
          </DialogTitle>
          <DialogDescription>
            A full Arabic sentence with its translation, usage notes and
            constituent words.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arabic text</FormLabel>
                  <FormControl>
                    <Input
                      className="arabic-text text-lg"
                      placeholder="أنا أحب القراءة"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="audioUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audio URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="meaningEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meaning (English)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="meaningBn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meaning (Bangla)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="whenToUseEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>When to use (English)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whenToUseBn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>When to use (Bangla)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Categories</Label>
              <Controller
                control={form.control}
                name="categoryIds"
                render={({ field }) => (
                  <CategoryMultiSelect
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {isEditing && arabic && (
              <>
                <Separator />
                <div className="space-y-2 rounded-md border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase tracking-wide text-muted">
                      AI-generated info (read-only)
                    </Label>
                    <div className="flex gap-1.5">
                      <StatusBadge status={arabic.status} />
                      <StatusBadge status={arabic.aiStatus} />
                    </div>
                  </div>

                  {hasAiInfo ? (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {arabic.pronunciationEn && (
                        <p>
                          <span className="text-muted">Pronunciation (En): </span>
                          {arabic.pronunciationEn}
                        </p>
                      )}
                      {arabic.pronunciationBn && (
                        <p>
                          <span className="text-muted">Pronunciation (Bn): </span>
                          {arabic.pronunciationBn}
                        </p>
                      )}
                      {arabic.feminineEn && (
                        <p>
                          <span className="text-muted">Feminine (En): </span>
                          {arabic.feminineEn}
                        </p>
                      )}
                      {arabic.feminineBn && (
                        <p>
                          <span className="text-muted">Feminine (Bn): </span>
                          {arabic.feminineBn}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">
                      {arabic.aiStatus === "FAILED"
                        ? `AI generation failed${arabic.errorMessage ? `: ${arabic.errorMessage}` : "."
                        }`
                        : "Not generated yet."}
                    </p>
                  )}
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-1.5">
              <Label>Words in this sentence (in order)</Label>
              <p className="text-xs text-muted">
                Optional - leave empty to let AI generation fill this in
                later.
              </p>
              <WordPickerRows
                control={form.control}
                existingWords={sentence?.words ?? []}
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
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}