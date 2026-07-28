import { CategoryMultiSelect } from "@/components/category-multi-select";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  pronunciationEn: z.string().trim().min(1, "Required"),
  pronunciationBn: z.string().trim().min(1, "Required"),
  meaningEn: z.string().trim().min(1, "Required"),
  meaningBn: z.string().trim().min(1, "Required"),
  whenToUseEn: z.string().trim().optional(),
  whenToUseBn: z.string().trim().optional(),
  status: z.enum([
    "DRAFT",
    "PUBLISHED",
    "ACTIVE",
    "DISABLED",
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "FAILED",
  ]),
  categoryIds: z.array(z.string()).default([]),
  words: z
    .array(
      z.object({
        wordId: z.string().min(1, "Choose a word"),
        position: z.number().int().nonnegative(),
      }),
    )
    .min(1, "At least one word is required")
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
  console.log("render");
  const queryClient = useQueryClient();
  const isEditing = Boolean(sentence);
  console.log(isEditing);

  const form = useForm<SentenceValues>({
    resolver: zodResolver(sentenceSchema),
    defaultValues: {
      text: "",
      pronunciationEn: "",
      pronunciationBn: "",
      meaningEn: "",
      meaningBn: "",
      status: "DRAFT",
      categoryIds: [],
      words: [],
    },
  });

  // useEffect dependency ঠিক করা — object reference না, শুধু id দিয়ে
  useEffect(() => {
    if (open) {
      form.reset({
        text: sentence?.arabic.text ?? "",
        audioUrl: sentence?.arabic.audioUrl ?? "",
        pronunciationEn: sentence?.pronunciationEn ?? "",
        pronunciationBn: sentence?.pronunciationBn ?? "",
        meaningEn: sentence?.meaningEn ?? "",
        meaningBn: sentence?.meaningBn ?? "",
        whenToUseEn: sentence?.whenToUseEn ?? "",
        whenToUseBn: sentence?.whenToUseBn ?? "",
        status: sentence?.status ?? "DRAFT",
        categoryIds: sentence?.categories.map((c) => c.id) ?? [],
        words:
          sentence?.words
            .sort((a, b) => a.position - b.position)
            .map((w, i) => ({ wordId: w.id, position: i })) ?? [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sentence?.id]);

  // submit-এর আগে position সবসময় array order থেকে re-derive —
  // drag/move যাই হোক, final payload-এ সবসময় sequential 0,1,2... থাকবে
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
      console.log({ err });
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
                name="pronunciationEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pronunciation (English)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pronunciationBn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pronunciation (Bangla)</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="DISABLED">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
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
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label>Words in this sentence (in order)</Label>
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
              {Object.keys(form.formState.errors).length > 0 && (
                <pre className="text-xs text-red-500">
                  {JSON.stringify(form.formState.errors, null, 2)}
                </pre>
              )}
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
