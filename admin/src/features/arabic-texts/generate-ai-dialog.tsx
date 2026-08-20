import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { generateArabicText } from "./api";

export function GenerateArabicTextDialog() {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => generateArabicText(text.trim()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["arabic-texts"] });
            toast.success("Queued for AI processing");
            setText("");
            setOpen(false);
        },
        onError: (err) => {
            const message =
                err instanceof AxiosError
                    ? (err.response?.data?.message ??
                        "Generation failed. Please try again.")
                    : "Generation failed. Please try again.";
            toast.error(message);
        },
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate via AI
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generate Arabic text</DialogTitle>
                    <DialogDescription>
                        Enter Arabic text (non-Arabic input gets translated first). It's
                        queued and enriched with meaning, pronunciation and usage notes in
                        the background.
                    </DialogDescription>
                </DialogHeader>

                <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g. مرحبا بك"
                    className="arabic-text min-h-28 text-lg"
                    dir="auto"
                    disabled={mutation.isPending}
                />

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={mutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={!text.trim() || mutation.isPending}
                    >
                        {mutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        {mutation.isPending ? "Queuing…" : "Generate"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}