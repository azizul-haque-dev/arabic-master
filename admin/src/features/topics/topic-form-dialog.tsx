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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { Topic } from "@/types/conversation";
import { createTopic, updateTopic } from "./api";

const topicSchema = z.object({
  titleEn: z.string().trim().min(1, "English title is required").max(160),
  titleBn: z.string().trim().max(160).optional(),
});

type TopicValues = z.infer<typeof topicSchema>;

interface TopicFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic?: Topic | null;
}

export function TopicFormDialog({
  open,
  onOpenChange,
  topic,
}: TopicFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(topic);

  const form = useForm<TopicValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: { titleEn: "", titleBn: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        titleEn: topic?.titleEn ?? "",
        titleBn: topic?.titleBn ?? "",
      });
    }
  }, [open, topic, form]);

  const mutation = useMutation({
    mutationFn: (values: TopicValues) =>
      isEditing && topic
        ? updateTopic(topic.id, values)
        : createTopic(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast.success(isEditing ? "Topic updated" : "Topic created");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit topic" : "New topic"}</DialogTitle>
          <DialogDescription>
            Topics group conversation sets learners can browse by subject.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="titleEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="At the airport" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="titleBn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (Bangla)</FormLabel>
                  <FormControl>
                    <Input placeholder="বিমানবন্দরে" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
