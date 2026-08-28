import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Sentence } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DialogFooterActions } from "@/components/common/form/DialogFooterActions";
import { DialogHeaderSection } from "@/components/common/form/DialogHeaderSection";
import { FormFieldAudioUrl } from "@/components/common/form/FormFieldAudioUrl";
import { FormFieldText } from "@/components/common/form/FormFieldText";
import { FormGroupMeaning } from "@/components/common/form/FormGroupMeaning";

import { FormGroupWhenToUse } from "@/components/common/form/FormGroupWhenToUse";

// Local imports
import { FormFieldCategories } from "@/components/common/form/FormFieldCategories";
import { AIInfoDisplay } from "@/components/common/shared/AIInfoDisplay";
import { useFormDialog } from "@/hooks/useFormDialog";
import { createSentence, updateSentence } from "../api";
import { WordPickerRows } from "./word-picker-rows";

// Schema definition - updated to match new requirements
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
  // Optional now - the AI worker can populate words later
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

  const { mutation } = useFormDialog<SentenceValues, Sentence>({
    queryKey: ["sentences"],
    createFn: createSentence,
    updateFn: updateSentence,
    entityId: sentence?.id,
    onSuccess: () => onOpenChange(false),
    successMessage: {
      create: "Sentence created",
      update: "Sentence updated",
    },
  });

  const onSubmit = (values: SentenceValues) => {
    const payload = {
      ...values,
      audioUrl: values.audioUrl || undefined,
      words: values.words.map((w, i) => ({ ...w, position: i })),
    };
    mutation.mutate(payload);
  };

  // Get arabic text for AI info display
  const arabic = sentence?.arabic;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeaderSection
          title={isEditing ? "Edit sentence" : "New sentence"}
          description="A full Arabic sentence with its translation, usage notes and constituent words."
        />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 max-w-2xl"
          >
            <FormFieldText
              control={form.control}
              name="text"
              label="Arabic text"
              placeholder="أنا أحب القراءة"
              className="arabic-text text-lg"
              required
            />

            <FormFieldAudioUrl control={form.control} name="audioUrl" />

            <FormGroupMeaning
              control={form.control}
              nameEn="meaningEn"
              nameBn="meaningBn"
            />

            <FormGroupWhenToUse
              control={form.control}
              nameEn="whenToUseEn"
              nameBn="whenToUseBn"
            />

            <FormFieldCategories control={form.control} name="categoryIds" />

            {/* AI-generated info display - only for editing */}
            {isEditing && arabic && <AIInfoDisplay arabic={arabic} />}

            <Separator />

            <div className="space-y-1.5">
              <Label>Words in this sentence (in order)</Label>
              <p className="text-xs text-muted">
                Optional - leave empty to let AI generation fill this in later.
              </p>
              <WordPickerRows
                control={form.control}
                existingWords={sentence?.words ?? []}
              />
              {form.formState.errors.words && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.words.message}
                </p>
              )}
            </div>

            <DialogFooterActions
              onCancel={() => onOpenChange(false)}
              isPending={mutation.isPending}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
