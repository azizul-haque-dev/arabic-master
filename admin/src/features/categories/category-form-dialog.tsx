import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createCategory, updateCategory } from "./api";
import type { Category } from "@/types";

const categorySchema = z.object({
  nameEn: z.string().trim().min(1, "English name is required").max(120),
  nameBn: z.string().trim().min(1, "Bangla name is required").max(120),
});

type CategoryValues = z.infer<typeof categorySchema>;

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null; // present = editing, absent = creating
}

export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(category);

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { nameEn: "", nameBn: "" },
  });

  // Reset the form whenever a different category is opened for editing.
  useEffect(() => {
    if (open) {
      form.reset({ nameEn: category?.nameEn ?? "", nameBn: category?.nameBn ?? "" });
    }
  }, [open, category, form]);

  const mutation = useMutation({
    mutationFn: (values: CategoryValues) =>
      isEditing ? updateCategory(category!.id, values) : createCategory(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(isEditing ? "Category updated" : "Category created");
      onOpenChange(false);
    },
    onError: (err) => {
      const message = err instanceof AxiosError ? err.response?.data?.message ?? "Something went wrong" : "Something went wrong";
      toast.error(message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>Categories group words and sentences for browsing/filtering.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
            <FormField
              control={form.control}
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="Greetings" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameBn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (Bangla)</FormLabel>
                  <FormControl>
                    <Input placeholder="অভিবাদন" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
