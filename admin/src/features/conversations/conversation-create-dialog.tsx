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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { SentenceSearchCombobox } from "./sentence-search-combobox";
import { createConversation } from "./api";

const schema = z.object({
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
    speaker: z.string().trim().min(1, "Speaker is required").max(50),
    sentenceId: z.string().min(1, "Choose the first sentence"),
    meaningEn: z.string().trim().optional(),
    meaningBn: z.string().trim().optional(),
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
            sentenceId: "",
            meaningEn: "",
            meaningBn: "",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                level: "BEGINNER",
                speaker: "",
                sentenceId: "",
                meaningEn: "",
                meaningBn: "",
            });
        }
    }, [open, form]);

    const mutation = useMutation({
        mutationFn: (values: Values) =>
            createConversation({
                topicConversationId: tcId,
                level: values.level,
                lines: [
                    {
                        sentenceId: values.sentenceId,
                        speaker: values.speaker,
                        position: 0,
                        meaningEn: values.meaningEn || undefined,
                        meaningBn: values.meaningBn || undefined,
                    },
                ],
            }),
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
                    ? (err.response?.data?.message ?? "Could not create this conversation")
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
                                name="sentenceId"
                                render={({ field }) => (
                                    <SentenceSearchCombobox
                                        value={field.value}
                                        onChange={(id) => field.onChange(id)}
                                    />
                                )}
                            />
                            {form.formState.errors.sentenceId && (
                                <p className="text-xs font-medium text-destructive">
                                    {form.formState.errors.sentenceId.message}
                                </p>
                            )}
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