import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CategoryMultiSelect } from "@/components/category-multi-select";
import { createWord, updateWord } from "./api";
import type { Word } from "@/types";

const wordSchema = z.object({
  text: z.string().trim().min(1, "Arabic text is required"),
  audioUrl: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  meaningEn: z.string().trim().optional(),
  meaningBn: z.string().trim().optional(),
  whenToUseEn: z.string().trim().optional(),
  whenToUseBn: z.string().trim().optional(),
  pronunciationEn: z.string().trim().optional(),
  pronunciationBn: z.string().trim().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ACTIVE", "DISABLED"]),
  categoryIds: z.array(z.string()).default([]),
});

type WordValues = z.infer<typeof wordSchema>;

interface WordFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  word?: Word | null;
}

export function WordFormDialog({ open, onOpenChange, word }: WordFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(word);

  const form = useForm<WordValues>({
    resolver: zodResolver(wordSchema),
    defaultValues: { text: "", status: "DRAFT", categoryIds: [] },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        text: word?.arabic.text ?? "",
        audioUrl: word?.arabic.audioUrl ?? "",
        meaningEn: word?.meaningEn ?? "",
        meaningBn: word?.meaningBn ?? "",
        whenToUseEn: word?.whenToUseEn ?? "",
        whenToUseBn: word?.whenToUseBn ?? "",
        pronunciationEn: word?.pronunciationEn ?? "",
        pronunciationBn: word?.pronunciationBn ?? "",
        status: word?.status ?? "DRAFT",
        categoryIds: word?.categories.map((c) => c.id) ?? [],
      });
    }
  }, [open, word, form]);

  const mutation = useMutation({
    mutationFn: (values: WordValues) => {
      const payload = { ...values, audioUrl: values.audioUrl || undefined };
      return isEditing ? updateWord(word!.id, payload) : createWord(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["words"] });
      toast.success(isEditing ? "Word updated" : "Word created");
      onOpenChange(false);
    },
    onError: (err) => {
      const message = err instanceof AxiosError ? err.response?.data?.message ?? "Something went wrong" : "Something went wrong";
      toast.error(message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit word" : "New word"}</DialogTitle>
          <DialogDescription>The Arabic text and its English/Bangla meaning, pronunciation and usage.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arabic text</FormLabel>
                  <FormControl>
                    <Input className="arabic-text text-lg" placeholder="كتاب" {...field} />
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
                      <Input placeholder="Book" {...field} />
                    </FormControl>
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
                      <Input placeholder="বই" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pronunciationEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pronunciation (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="ki-taab" {...field} />
                    </FormControl>
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
                      <Input placeholder="কিতাব" {...field} />
                    </FormControl>
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
                  render={({ field }) => <CategoryMultiSelect value={field.value} onChange={field.onChange} />}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
