"use client";

import { useState } from "react";
import {
  AlertCircle,
  FileAudio,
  Plus,
  RefreshCw,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AudioPlayer } from "@/components/shared/audio-player";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteEntityAudio } from "@/lib/audio/audio-client";
import type { EntityAudio } from "@/lib/audio/types";
import { AudioUploadDialog } from "./audio-upload-dialog";
import { useEntityAudio } from "./use-entity-audio";

export interface EntityAudioPanelProps {
  entityId: string;
  entityLabel?: string;
  canEdit?: boolean;
  disabledReason?: string;
  className?: string;
  onAudioChange?: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function EntityAudioPanel({
  entityId,
  entityLabel = "Arabic Audio",
  canEdit = true,
  disabledReason,
  className = "",
  onAudioChange,
}: EntityAudioPanelProps) {
  const { audios, status, error, refetch } = useEntityAudio(entityId);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedVariantForUpload, setSelectedVariantForUpload] = useState<string>("DEFAULT");
  const [deleteTarget, setDeleteTarget] = useState<EntityAudio | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Track playback retry per variant to avoid infinite retry loops
  const [hasRetriedVariant, setHasRetriedVariant] = useState<Record<string, boolean>>({});

  const handleOpenUpload = (variantToUse = "DEFAULT") => {
    setSelectedVariantForUpload(variantToUse);
    setUploadDialogOpen(true);
    setActionError(null);
  };

  const handlePlaybackError = async (variant: string) => {
    if (!hasRetriedVariant[variant]) {
      setHasRetriedVariant((prev) => ({ ...prev, [variant]: true }));
      // Presigned URLs expire after 1 hour. Refetch fresh playback URLs once.
      await refetch();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);
    setActionError(null);

    try {
      await deleteEntityAudio(entityId, deleteTarget.variant);
      setDeleteTarget(null);
      await refetch();
      onAudioChange?.();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete audio recording."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const existingVariants = audios.map((a) => a.variant);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Header section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
          <h3 className="font-heading text-sm font-semibold text-text">
            Audio Recordings
            {audios.length > 0 ? (
              <span className="ml-1.5 text-xs font-normal text-text-muted">
                ({audios.length})
              </span>
            ) : null}
          </h3>
        </div>

        {canEdit && status !== "loading" ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleOpenUpload(audios.length === 0 ? "DEFAULT" : "")}
            className="self-start sm:self-auto min-h-[36px]"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add Audio
          </Button>
        ) : null}
      </div>

      {/* Action error banner */}
      {actionError ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-default border border-error/25 bg-error-bg p-3 text-xs text-error-text"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1 font-bengali leading-relaxed">{actionError}</div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-error-text hover:underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {/* Loading state skeleton */}
      {status === "loading" ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border bg-white p-4">
            <div className="flex items-center justify-between pb-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-10 w-full rounded-default" />
          </div>
          <div className="rounded-lg border border-border bg-white p-4">
            <div className="flex items-center justify-between pb-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-full rounded-default" />
          </div>
        </div>
      ) : null}

      {/* Error state */}
      {status === "error" ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-white p-6 text-center">
          <AlertCircle className="h-8 w-8 text-error mb-2" aria-hidden="true" />
          <p className="text-sm font-medium text-text">Failed to load audio recordings</p>
          <p className="mt-1 text-xs text-text-muted max-w-sm font-bengali">
            {error || "Unable to retrieve audio variants for this Arabic entity."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            className="mt-4"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : null}

      {/* Empty state */}
      {status === "success" && audios.length === 0 ? (
        <EmptyState
          icon={VolumeX}
          title="No audio recordings yet"
          description="This entity does not have any pronunciation audio recordings uploaded yet."
          action={
            canEdit ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleOpenUpload("DEFAULT")}
                className="min-h-[44px]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Upload Pronunciation Audio
              </Button>
            ) : null
          }
          className="py-8"
        />
      ) : null}

      {/* Audio variants list */}
      {status === "success" && audios.length > 0 ? (
        <div className="flex flex-col gap-3">
          {audios.map((audio) => (
            <div
              key={audio.id || audio.variant}
              className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4 shadow-sm"
            >
              {/* Variant meta header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary/10 text-primary font-mono text-[11px] font-semibold">
                    {audio.variant}
                  </Badge>

                  {audio.speaker ? (
                    <span className="text-xs text-text-secondary">
                      Speaker: <strong className="font-medium text-text">{audio.speaker}</strong>
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-text-muted">
                  <span>{formatBytes(audio.fileSizeBytes)}</span>
                  <span>·</span>
                  <span className="uppercase">{audio.mimeType.split("/")[1] || "audio"}</span>
                  <span>·</span>
                  <span>{new Date(audio.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Audio player */}
              <div className="pt-1">
                <AudioPlayer
                  src={audio.playbackUrl}
                  label={`${entityLabel} (${audio.variant})`}
                  onError={() => void handlePlaybackError(audio.variant)}
                />
              </div>

              {/* Action buttons (Replace / Delete) */}
              {canEdit ? (
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenUpload(audio.variant)}
                    className="text-xs text-text-secondary hover:text-text min-h-[36px]"
                  >
                    <FileAudio className="h-3.5 w-3.5" aria-hidden="true" />
                    Replace audio
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteTarget(audio)}
                    className="text-xs text-error hover:bg-error-bg min-h-[36px]"
                    aria-label={`Delete ${audio.variant} audio variant`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {/* Reusable Audio Upload Dialog */}
      <AudioUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        entityId={entityId}
        entityLabel={entityLabel}
        defaultVariant={selectedVariantForUpload}
        existingVariants={existingVariants}
        canEdit={canEdit}
        disabledReason={disabledReason}
        onUploaded={() => {
          void refetch();
          onAudioChange?.();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDeleteTarget(null);
        }}
        title="Delete Audio Recording"
        description={`Are you sure you want to permanently delete the "${deleteTarget?.variant}" audio variant for this Arabic entity? This action cannot be undone.`}
        confirmLabel={isDeleting ? "Deleting..." : "Delete Recording"}
        onConfirm={() => {
          void handleDeleteConfirm();
        }}
      />
    </div>
  );
}
