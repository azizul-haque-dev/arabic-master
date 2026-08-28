import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import type { Word } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Local imports
import { DialogFooterActions } from "@/components/common/form/DialogFooterActions";
import { DialogHeaderSection } from "@/components/common/form/DialogHeaderSection";
import { FormFieldAudioUrl } from "@/components/common/form/FormFieldAudioUrl";
import { FormFieldCategories } from "@/components/common/form/FormFieldCategories";
import { FormFieldStatus } from "@/components/common/form/FormFieldStatus";
import { FormFieldText } from "@/components/common/form/FormFieldText";
import { FormGroupMeaning } from "@/components/common/form/FormGroupMeaning";
import { FormGroupWhenToUse } from "@/components/common/form/FormGroupWhenToUse";
import { useFormDialog } from "@/hooks/useFormDialog";
import { createWord, updateWord } from "./api";

// Schema definition
const wordSchema = z.object({
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
  status: z.enum(["DRAFT", "PUBLISHED", "ACTIVE", "DISABLED"]),
  categoryIds: z.array(z.string()).default([]),
});

type WordValues = z.infer<typeof wordSchema>;

interface WordFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  word?: Word | null;
}

export function WordFormDialog({
  open,
  onOpenChange,
  word,
}: WordFormDialogProps) {
  const isEditing = Boolean(word);

  const form = useForm<WordValues>({
    resolver: zodResolver(wordSchema),
    defaultValues: {
      text: "",
      audioUrl: "",
      meaningEn: "",
      meaningBn: "",
      whenToUseEn: "",
      whenToUseBn: "",
      status: "DRAFT",
      categoryIds: [],
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      text: word?.arabic.text ?? "",
      audioUrl: word?.arabic.audioUrl ?? "",
      meaningEn: word?.meaningEn ?? "",
      meaningBn: word?.meaningBn ?? "",
      whenToUseEn: word?.whenToUseEn ?? "",
      whenToUseBn: word?.whenToUseBn ?? "",
      status: (word?.status as WordValues["status"]) ?? "DRAFT",
      categoryIds: word?.categories.map((c) => c.id) ?? [],
    });
  }, [open, word, form]);

  const { mutation } = useFormDialog<WordValues, Word>({
    queryKey: ["words"],
    createFn: createWord,
    updateFn: updateWord,
    entityId: word?.id,
    onSuccess: () => onOpenChange(false),
    successMessage: {
      create: "Word created",
      update: "Word updated",
    },
  });

  const onSubmit = (values: WordValues) => {
    const payload = { ...values, audioUrl: values.audioUrl || undefined };
    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeaderSection
          title={isEditing ? "Edit word" : "New word"}
          description="The Arabic text and its English/Bangla meaning, pronunciation and usage."
        />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) =>
              console.error("Zod Validation Errors:", errors),
            )}
            className="space-y-4"
          >
            <FormFieldText
              control={form.control}
              name="text"
              label="Arabic text"
              placeholder="كتاب"
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

            <div className="grid grid-cols-2 gap-4">
              <FormFieldStatus control={form.control} name="status" />
              <FormFieldCategories control={form.control} name="categoryIds" />
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
