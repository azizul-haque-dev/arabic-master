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
import { Textarea } from "@/components/ui/textarea";
import type { ArabicTextEntry } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createArabicText, updateArabicText } from "./api";
import { arabicTextSchema, type ArabicTextValues } from "./arabic-text.validation";


interface ArabicTextFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    arabicText?: ArabicTextEntry | null; // present = editing, absent = creating
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
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Arabic text" : "New Arabic text"}
                    </DialogTitle>
                    <DialogDescription>
                        A standalone Arabic text entry with meaning, pronunciation and
                        usage notes. Not linked to a Word or Sentence yet.
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
                                            placeholder="مرحبا"
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
                            <FormField
                                control={form.control}
                                name="feminineEn"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Feminine form (English)</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="feminineBn"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Feminine form (Bangla)</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
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
                                <Label>AI status</Label>
                                <Controller
                                    control={form.control}
                                    name="aiStatus"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="PROCESSING">Processing</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="FAILED">Failed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <p className="text-xs text-muted">
                                    Normally set automatically by the AI worker — only override
                                    if you need to force a state.
                                </p>
                            </div>
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
                                {mutation.isPending ? "Saving…" : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}