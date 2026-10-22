"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileAudio,
  Loader2,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AUDIO_ACCEPT_ATTRIBUTE,
  DEFAULT_VARIANT,
  SPEAKER_MAX_LENGTH,
  VARIANT_REGEX,
} from "@/lib/audio/constants";
import { validateAudioFile } from "@/lib/audio/validate-audio-file";
import { uploadEntityAudio } from "@/lib/audio/audio-client";
import { AudioApiError, type EntityAudio } from "@/lib/audio/types";
import { mapAudioError } from "@/lib/audio/map-audio-error";

export interface AudioUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  entityLabel: string;
  defaultVariant?: string;
  existingVariants?: string[];
  canEdit: boolean;
  disabledReason?: string;
  onUploaded?: (audio: EntityAudio) => void;
}

export function AudioUploadDialog({
  open,
  onOpenChange,
  entityId,
  entityLabel,
  defaultVariant = DEFAULT_VARIANT,
  existingVariants = [],
  canEdit,
  disabledReason,
  onUploaded,
}: AudioUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [variant, setVariant] = useState(defaultVariant);
  const [speaker, setSpeaker] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successAudio, setSuccessAudio] = useState<EntityAudio | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up object URLs to prevent browser memory leaks
  const cleanupPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const resetState = () => {
    cleanupPreview();
    setFile(null);
    setVariant(defaultVariant);
    setSpeaker("");
    setIsUploading(false);
    setUploadProgress(0);
    setErrorMessage(null);
    setSuccessAudio(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetState();
    }
    onOpenChange(nextOpen);
  };

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setVariant(defaultVariant);
      setErrorMessage(null);
      setSuccessAudio(null);
    }
  }

  // Cleanup abort controller on component unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleFileSelection = (selectedFile: File | null) => {
    setErrorMessage(null);
    setSuccessAudio(null);

    if (!selectedFile) {
      cleanupPreview();
      setFile(null);
      return;
    }

    const validation = validateAudioFile(selectedFile);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Invalid file.");
      cleanupPreview();
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    cleanupPreview();
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canEdit || isUploading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!canEdit || isUploading) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFileSelection(droppedFiles[0]);
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(0);
    setErrorMessage("আপলোড বাতিল করা হয়েছে। (Upload was cancelled.)");
  };

  const handleStartUpload = async () => {
    if (!file || !canEdit || isUploading) return;

    const trimmedVariant = variant.trim().toUpperCase();
    if (!trimmedVariant || !VARIANT_REGEX.test(trimmedVariant)) {
      setErrorMessage(
        "Variant must be 1-32 alphanumeric characters, hyphens, or underscores."
      );
      return;
    }

    const trimmedSpeaker = speaker.trim();
    if (trimmedSpeaker.length > SPEAKER_MAX_LENGTH) {
      setErrorMessage(`Speaker cannot exceed ${SPEAKER_MAX_LENGTH} characters.`);
      return;
    }

    setErrorMessage(null);
    setSuccessAudio(null);
    setIsUploading(true);
    setUploadProgress(0);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const uploaded = await uploadEntityAudio(entityId, {
        file,
        variant: trimmedVariant,
        speaker: trimmedSpeaker || undefined,
        signal: controller.signal,
        onProgress: (percent) => {
          setUploadProgress(percent);
        },
      });

      setSuccessAudio(uploaded);
      setIsUploading(false);
      onUploaded?.(uploaded);

      // Brief delay before closing so user sees success feedback
      setTimeout(() => {
        handleOpenChange(false);
      }, 1200);
    } catch (err) {
      setIsUploading(false);
      setUploadProgress(0);

      if (err instanceof AudioApiError) {
        if (!err.isAborted) {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage(
          mapAudioError(0, err instanceof Error ? err.message : null)
        );
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const normalizedUpperVariant = variant.trim().toUpperCase();
  const willReplaceExisting =
    Boolean(normalizedUpperVariant) &&
    existingVariants.some((v) => v.toUpperCase() === normalizedUpperVariant);

  const isVariantValid =
    Boolean(normalizedUpperVariant) && VARIANT_REGEX.test(normalizedUpperVariant);
  const isSpeakerValid = speaker.trim().length <= SPEAKER_MAX_LENGTH;
  const isFormValid = Boolean(file) && isVariantValid && isSpeakerValid;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5 text-primary" aria-hidden="true" />
            Upload Audio Recording
          </DialogTitle>
          <DialogDescription>
            Attach or replace high-quality pronunciation audio for this Arabic entity.
          </DialogDescription>
        </DialogHeader>

        {/* Entity context header */}
        <div className="flex items-center justify-between rounded-default border border-border bg-neutral-bg/60 p-3">
          <div>
            <p className="text-xs font-medium text-text-muted">Target Entity</p>
            <p className="text-xs font-mono text-text-secondary">{entityId}</p>
          </div>
          <div className="text-right">
            <span
              dir="rtl"
              lang="ar"
              className="font-arabic text-2xl font-semibold text-text"
            >
              {entityLabel}
            </span>
          </div>
        </div>

        {/* Permission guard */}
        {!canEdit ? (
          <div className="flex gap-3 rounded-default border border-warning-text/25 bg-warning-bg p-4 text-sm text-warning-text">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Permission Restricted</p>
              <p className="mt-1 font-bengali text-xs leading-relaxed">
                {disabledReason ||
                  "Content Manager শুধুমাত্র Draft বা Rejected অবস্থায় audio পরিবর্তন করতে পারে।"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 py-1">
            {/* Success banner */}
            {successAudio ? (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center gap-2.5 rounded-default border border-success-text/20 bg-success-bg p-3.5 text-sm font-medium text-success-text"
              >
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span>Audio uploaded successfully! (Variant: {successAudio.variant})</span>
              </div>
            ) : null}

            {/* Error banner */}
            {errorMessage ? (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-2.5 rounded-default border border-error/25 bg-error-bg p-3.5 text-sm text-error-text"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-medium">Upload Error</p>
                  <p className="mt-0.5 font-bengali text-xs leading-relaxed">{errorMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="rounded-sm p-1 text-error-text hover:bg-error-bg/60"
                  aria-label="Dismiss error"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}

            {/* Drag & Drop Upload Zone */}
            <div>
              <Label htmlFor="audio-file-input">Audio File</Label>
              <input
                ref={fileInputRef}
                id="audio-file-input"
                type="file"
                accept={AUDIO_ACCEPT_ATTRIBUTE}
                className="sr-only"
                disabled={isUploading}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    handleFileSelection(files[0]);
                  }
                }}
              />

              {!file ? (
                <label
                  htmlFor="audio-file-input"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isDragging
                      ? "border-primary bg-primary-light/10"
                      : "border-border-strong bg-neutral-bg/30 hover:border-primary hover:bg-neutral-bg/60"
                  }`}
                >
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                    <UploadCloud className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-semibold text-text">
                    Click to select or drag & drop audio
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Supports MP3, WAV, OGG, M4A, WebM (Max 10MB)
                  </p>
                </label>
              ) : (
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-3.5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary-light/25 text-primary">
                        <FileAudio className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text">
                          {file.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB · {file.type || "audio"}
                        </p>
                      </div>
                    </div>

                    {!isUploading ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          cleanupPreview();
                          setFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        aria-label="Remove audio file"
                        className="text-text-muted hover:text-error-text"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>

                  {/* Audio preview player */}
                  {previewUrl ? (
                    <div className="rounded-default bg-neutral-bg p-2">
                      <p className="mb-1 text-[11px] font-medium text-text-muted">
                        Preview before upload:
                      </p>
                      <audio
                        controls
                        src={previewUrl}
                        className="h-8 w-full"
                        aria-label="Audio preview"
                      />
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Variant & Speaker inputs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="audio-variant">Variant</Label>
                  <span className="text-[11px] text-text-muted">e.g. DEFAULT, FAST</span>
                </div>
                <Input
                  id="audio-variant"
                  value={variant}
                  disabled={isUploading}
                  onChange={(e) => {
                    setVariant(e.target.value.toUpperCase());
                  }}
                  placeholder="DEFAULT"
                  className={!isVariantValid && variant ? "border-error" : ""}
                />
                {!isVariantValid && variant ? (
                  <p className="mt-1 text-[11px] text-error-text">
                    1-32 chars: letters, numbers, hyphens, underscores.
                  </p>
                ) : null}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="audio-speaker">Speaker (Optional)</Label>
                  <span className="text-[11px] text-text-muted">
                    {speaker.length}/{SPEAKER_MAX_LENGTH}
                  </span>
                </div>
                <Input
                  id="audio-speaker"
                  value={speaker}
                  disabled={isUploading}
                  maxLength={SPEAKER_MAX_LENGTH}
                  onChange={(e) => setSpeaker(e.target.value)}
                  placeholder="e.g. Native Speaker (M)"
                />
              </div>
            </div>

            {/* Replace Warning Notice */}
            {willReplaceExisting && !isUploading ? (
              <div className="flex gap-2.5 rounded-default border border-warning-text/20 bg-warning-bg p-3 text-xs text-warning-text">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <div>
                  <span className="font-semibold">Replace Notice:</span> এই variant (
                  <strong>{normalizedUpperVariant}</strong>)-এ audio আগে থেকেই আছে। আপলোড
                  করলে পুরোনো অডিওটি replace (নতুন ফাইল দিয়ে প্রতিস্থাপিত) হবে।
                </div>
              </div>
            ) : null}

            {/* Upload Progress Bar */}
            {isUploading ? (
              <div className="flex flex-col gap-1.5 rounded-default bg-neutral-bg p-3">
                <div className="flex items-center justify-between text-xs font-medium text-text">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    Uploading audio to server...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={uploadProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Audio upload progress"
                  className="h-2 w-full overflow-hidden rounded-full bg-border"
                >
                  <div
                    className="h-full bg-primary transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter className="mt-4">
          {!canEdit ? (
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          ) : isUploading ? (
            <Button variant="destructive" onClick={handleCancelUpload}>
              Cancel Upload
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStartUpload}
                disabled={!isFormValid || isUploading}
                className="min-h-[44px]"
              >
                {willReplaceExisting ? "Replace Audio" : "Upload Audio"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
