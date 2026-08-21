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
import type { TopicConversation } from "@/types/conversation";
import { createTopicConversation, updateTopicConversation } from "./api";

const schema = z.object({
  titleEn: z.string().trim().min(1, "English title is required").max(160),
  titleBn: z.string().trim().max(160).optional(),
});

type Values = z.infer<typeof schema>;

interface TopicConversationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topicId: string;
  topicConversation?: TopicConversation | null;
}

export function TopicConversationFormDialog({
  open,
  onOpenChange,
  topicId,
  topicConversation,
}: TopicConversationFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(topicConversation);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { titleEn: "", titleBn: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        titleEn: topicConversation?.titleEn ?? "",
        titleBn: topicConversation?.titleBn ?? "",
      });
    }
  }, [open, topicConversation, form]);

  const mutation = useMutation({
    mutationFn: (values: Values) =>
      isEditing && topicConversation
        ? updateTopicConversation(topicConversation.id, values)
        : createTopicConversation({ topicId, ...values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topic-conversations", topicId] });
      toast.success(isEditing ? "Conversation set updated" : "Conversation set created");
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
          <DialogTitle>
            {isEditing ? "Edit conversation set" : "New conversation set"}
          </DialogTitle>
          <DialogDescription>
            A group of related conversations within this topic (e.g. "Checking in").
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
                    <Input placeholder="Checking in at the counter" {...field} />
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
                    <Input placeholder="কাউন্টারে চেক-ইন" {...field} />
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
