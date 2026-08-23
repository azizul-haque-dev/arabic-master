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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createConversationLine } from "@/features/conversation-lines/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { createConversation } from "./api";
import { SentenceSearchCombobox } from "./sentence-search-combobox";

const schema = z
  .object({
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
    speaker: z.string().trim().min(1, "Speaker is required").max(50),
    mode: z.enum(["search", "generate"]),
    sentenceId: z.string().optional(),
    text: z.string().trim().optional(),
    meaningEn: z.string().trim().optional(),
    meaningBn: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "search" && !data.sentenceId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose a sentence",
        path: ["sentenceId"],
      });
    }
    if (data.mode === "generate" && !data.text) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter the line's text",
        path: ["text"],
      });
    }
  });

type Values = z.infer<typeof schema>;

interface ConversationCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topicId: string;
  tcId: string;
}

export function ConversationCreateDialog({
  open,
  onOpenChange,
  topicId,
  tcId,
}: ConversationCreateDialogProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      level: "BEGINNER",
      speaker: "",
      mode: "search",
      sentenceId: "",
      text: "",
      meaningEn: "",
      meaningBn: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        level: "BEGINNER",
        speaker: "",
        mode: "search",
        sentenceId: "",
        text: "",
        meaningEn: "",
        meaningBn: "",
      });
    }
  }, [open, form]);

  // Two real calls, chained: create the (empty) conversation, then create
  // its first line against the returned id — mirrors how the builder page
  // adds every subsequent line. If the second call fails, the conversation
  // still exists and is reachable from the list to finish setting up.
  const mutation = useMutation({
    mutationFn: async (values: Values) => {
      const conversation = await createConversation(tcId, values.level);
      await createConversationLine({
        conversationId: conversation.id,
        speaker: values.speaker,
        position: 0,
        ...(values.mode === "search"
          ? { sentenceId: values.sentenceId }
          : { text: values.text }),
        meaningEn: values.meaningEn || undefined,
        meaningBn: values.meaningBn || undefined,
      });
      return conversation;
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations", tcId] });
      toast.success("Conversation created");
      onOpenChange(false);
      navigate(
        `/topics/${topicId}/topic-conversations/${tcId}/conversations/${conversation.id}`,
      );
    },
    onError: (err) => {
      const message =
        err instanceof AxiosError
          ? (err.response?.data?.message ??
            "Could not create this conversation")
          : "Could not create this conversation";
      toast.error(message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New conversation</DialogTitle>
          <DialogDescription>
            Set the difficulty level and add the opening line — you can add more
            lines right after this on the builder screen.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Level</Label>
              <Controller
                control={form.control}
                name="level"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="speaker"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First speaker</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Ahmed, Speaker A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-1.5">
              <FormLabel>First sentence</FormLabel>
              <Controller
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <Tabs
                    value={field.value}
                    onValueChange={(v) =>
                      field.onChange(v as "search" | "generate")
                    }
                  >
                    <TabsList>
                      <TabsTrigger value="search">Pick existing</TabsTrigger>
                      <TabsTrigger value="generate">Type new</TabsTrigger>
                    </TabsList>

                    <TabsContent value="search">
                      <Controller
                        control={form.control}
                        name="sentenceId"
                        render={({ field: sentenceField }) => (
                          <SentenceSearchCombobox
                            value={sentenceField.value ?? ""}
                            onChange={(id) => sentenceField.onChange(id)}
                          />
                        )}
                      />
                      {form.formState.errors.sentenceId && (
                        <p className="mt-1 text-xs font-medium text-destructive">
                          {form.formState.errors.sentenceId.message}
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="generate">
                      <Controller
                        control={form.control}
                        name="text"
                        render={({ field: textField }) => (
                          <Textarea
                            placeholder="e.g. أين أقرب مطعم؟ — or type in English/Bangla"
                            className="arabic-text"
                            dir="auto"
                            rows={2}
                            {...textField}
                          />
                        )}
                      />
                      <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                        Matches an existing sentence, or creates a new one and
                        lets AI fill in the rest.
                      </p>
                      {form.formState.errors.text && (
                        <p className="mt-1 text-xs font-medium text-destructive">
                          {form.formState.errors.text.message}
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              />
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
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Creating…" : "Create conversation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
