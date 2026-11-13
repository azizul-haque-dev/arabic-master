"use client";

import { Button } from "@/components/ui/button";
import type { AdminRole, ContentStatus } from "@/lib/types/content";

export function ContentActionBar({
  role,
  status,
  onSaveDraft,
  onSubmitForReview,
  onApprove,
  onReject,
  onPublish,
  onCancel,
}: {
  role: AdminRole;
  status: ContentStatus;
  onSaveDraft?: () => void;
  onSubmitForReview?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onPublish?: () => void;
  onCancel?: () => void;
}) {
  const isAdmin = role === "ADMIN";

  // For Admin: all action buttons are accessible.
  // For Content Manager: follows strict sequential workflow.
  const canSaveDraft = isAdmin || status === "DRAFT";
  const canSubmitForReview = isAdmin || status === "DRAFT" || status === "REJECTED";
  const canReject = isAdmin;
  const canApprove = isAdmin;
  const canPublish = isAdmin;

  return (
    <div className="flex flex-wrap items-center gap-2 justify-stretch sm:justify-end">
      {onCancel ? (
        <Button
          variant="ghost"
          onClick={onCancel}
          className="flex-1 min-w-[120px] sm:flex-initial sm:min-w-0"
        >
          Cancel
        </Button>
      ) : null}

      {onSaveDraft && canSaveDraft ? (
        <Button
          variant="secondary"
          onClick={onSaveDraft}
          className="flex-1 min-w-[120px] sm:flex-initial sm:min-w-0"
        >
          Save draft
        </Button>
      ) : null}

      {onSubmitForReview && canSubmitForReview ? (
        <Button
          variant="secondary"
          onClick={onSubmitForReview}
          className="flex-1 min-w-[140px] sm:flex-initial sm:min-w-0"
        >
          Submit for review
        </Button>
      ) : null}

      {onReject && canReject ? (
        <Button
          variant="destructive"
          className="flex-1 min-w-[100px] sm:flex-initial sm:min-w-0 border border-error/30"
          onClick={onReject}
        >
          Reject
        </Button>
      ) : null}

      {onApprove && canApprove ? (
        <Button
          variant="primary"
          onClick={onApprove}
          className="flex-1 min-w-[100px] sm:flex-initial sm:min-w-0"
        >
          Approve
        </Button>
      ) : null}

      {onPublish && canPublish ? (
        <Button
          variant="primary"
          onClick={onPublish}
          className="flex-1 min-w-[100px] sm:flex-initial sm:min-w-0"
        >
          Publish
        </Button>
      ) : null}
    </div>
  );
}
