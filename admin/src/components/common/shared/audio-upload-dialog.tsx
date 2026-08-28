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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
];

const audioFileSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, "Select an audio file")
    .refine(
      (files) => files[0]?.size <= MAX_FILE_SIZE,
      "File must be under 10mb",
    )
    .refine(
      (files) => ACCEPTED_TYPES.includes(files[0]?.type),
      "Only mp3, wav, or ogg files are allowed",
    ),
});

type AudioUploadValues = z.infer<typeof audioFileSchema>;

interface UploadAudioResponse {
  data: {
    success: boolean;
    message: string;
    data?: { publicUrl: string; key: string };
  };
}

interface AudioUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  textId: string;
  existingAudioUrl?: string | null;
  queryKeyToInvalidate: string[];
  title?: string;
  description?: string;
  triggerLabel?: string;
}

export function AudioUploadDialog({
  open,
  onOpenChange,
  textId,
  existingAudioUrl,
  queryKeyToInvalidate,
  title = "Upload Audio",
  description = "Attach a pronunciation clip to this entry",
  triggerLabel = "Upload audio",
}: AudioUploadDialogProps) {
  const queryClient = useQueryClient();
  console.log({ existingAudioUrl });

  const form = useForm<AudioUploadValues>({
    resolver: zodResolver(audioFileSchema),
  });

  // Watch the file input for changes
  const selectedFile = form.watch("file");

  // Generate a preview URL if a valid file is selected
  const previewUrl = useMemo(() => {
    if (selectedFile && selectedFile.length > 0) {
      return URL.createObjectURL(selectedFile[0]);
    }
    return null;
  }, [selectedFile]);

  // Cleanup the object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const { mutate: mutateAudio, isPending } = useMutation({
    mutationFn: async (values: AudioUploadValues) => {
      const formData = new FormData();
      formData.append("file", values.file[0]);
      formData.append("textId", textId);

      const { data } = await api.post<UploadAudioResponse>(
        "/media/audio",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
      form.reset();
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerLabel && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 size-4" />
            {triggerLabel}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutateAudio(values))}>
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <FormItem>
                  <FormLabel>Audio File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm"
                      onChange={(e) => onChange(e.target.files)}
                      onBlur={onBlur}
                      name={name}
                      ref={ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Audio Preview Section */}
            {!existingAudioUrl && previewUrl && (
              <div className="mt-4 flex flex-col gap-2 rounded-md border bg-slate-50 p-3 shadow-sm dark:bg-slate-900">
                <span className="text-xs font-medium text-slate-500">
                  Preview:
                </span>
                <audio
                  src={previewUrl}
                  controls
                  className="h-10 w-full outline-none"
                />
              </div>
            )}

            {existingAudioUrl && !previewUrl && (
              <div className="mt-4 flex flex-col gap-2 rounded-md border bg-slate-50 p-3 shadow-sm dark:bg-slate-900">
                <span className="text-xs font-medium text-slate-500">
                  Existing audio:
                </span>
                <audio
                  src={existingAudioUrl}
                  controls
                  className="h-10 w-full outline-none"
                />
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button disabled={isPending} type="submit">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
