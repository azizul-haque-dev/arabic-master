import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

import type { ArabicTextEntry } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Import reusable components

import { DialogFooterActions } from "@/components/common/form/DialogFooterActions";
import { DialogHeaderSection } from "@/components/common/form/DialogHeaderSection";
import { FormFieldAudioUrl } from "@/components/common/form/FormFieldAudioUrl";
import { FormFieldStatus } from "@/components/common/form/FormFieldStatus";
import { FormFieldText } from "@/components/common/form/FormFieldText";
import { FormGroupMeaning } from "@/components/common/form/FormGroupMeaning";
import { FormGroupPronunciation } from "@/components/common/form/FormGroupPronunciation";
import { FormGroupWhenToUse } from "@/components/common/form/FormGroupWhenToUse";
import { createArabicText, updateArabicText } from "./api";
import {
  arabicTextSchema,
  type ArabicTextValues,
} from "./arabic-text.validation";

interface ArabicTextFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  arabicText?: ArabicTextEntry | null;
}

export function ArabicTextFormDialog({
  open,
  onOpenChange,
  arabicText,
}: ArabicTextFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(arabicText);

  const form = useForm<ArabicTextValues>({
    resolver: zodResolver(arabicTextSchema),
    defaultValues: {
      text: "",
      audioUrl: "",
      pronunciationEn: "",
      pronunciationBn: "",
      meaningEn: "",
      meaningBn: "",
      whenToUseEn: "",
      whenToUseBn: "",
      feminineEn: "",
      feminineBn: "",
      status: "DRAFT",
      aiStatus: "PENDING",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      text: arabicText?.text ?? "",
      audioUrl: arabicText?.audioUrl ?? "",
      pronunciationEn: arabicText?.pronunciationEn ?? "",
      pronunciationBn: arabicText?.pronunciationBn ?? "",
      meaningEn: arabicText?.meaningEn ?? "",
      meaningBn: arabicText?.meaningBn ?? "",
      whenToUseEn: arabicText?.whenToUseEn ?? "",
      whenToUseBn: arabicText?.whenToUseBn ?? "",
      feminineEn: arabicText?.feminineEn ?? "",
      feminineBn: arabicText?.feminineBn ?? "",
      status: arabicText?.status ?? "DRAFT",
      aiStatus: arabicText?.aiStatus ?? "PENDING",
    });
  }, [open, arabicText, form]);

  const mutation = useMutation({
    mutationFn: (values: ArabicTextValues) => {
      const payload = { ...values, audioUrl: values.audioUrl || undefined };
      return isEditing
        ? updateArabicText(arabicText!.id, payload)
        : createArabicText(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["arabic-texts"] });
      toast.success(isEditing ? "Arabic text updated" : "Arabic text created");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeaderSection
          title={isEditing ? "Edit Arabic text" : "New Arabic text"}
          description="A standalone Arabic text entry with meaning, pronunciation and usage notes. Not linked to a Word or Sentence yet."
        />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <FormFieldText
              control={form.control}
              name="text"
              label="Arabic text"
              placeholder="مرحبا"
              className="arabic-text text-lg"
              required
            />

            <FormFieldAudioUrl control={form.control} name="audioUrl" />

            <FormGroupPronunciation
              control={form.control}
              nameEn="pronunciationEn"
              nameBn="pronunciationBn"
            />

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
              <FormFieldText
                control={form.control}
                name="feminineEn"
                label="Feminine form (English)"
              />
              <FormFieldText
                control={form.control}
                name="feminineBn"
                label="Feminine form (Bangla)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormFieldStatus control={form.control} name="status" />

              {/* AI Status field can be added here if needed */}
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
