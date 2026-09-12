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
  const canSubmitForReview = status === "DRAFT" || status === "REJECTED";
  const canApproveOrReject = role === "ADMIN" && status === "IN_REVIEW";
  const canPublish = role === "ADMIN" && status === "APPROVED";

  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
      {onCancel ? (
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      ) : null}

      {onSaveDraft ? (
        <Button variant="secondary" onClick={onSaveDraft}>
          Save draft
        </Button>
      ) : null}

      {onSubmitForReview && canSubmitForReview ? (
        <Button variant="secondary" onClick={onSubmitForReview}>
          Submit for review
        </Button>
      ) : null}

      {onReject && canApproveOrReject ? (
        <Button
          variant="destructive"
          className="border border-error/30"
          onClick={onReject}
        >
          Reject
        </Button>
      ) : null}

      {onApprove && canApproveOrReject ? (
        <Button variant="primary" onClick={onApprove}>
          Approve
        </Button>
      ) : null}

      {onPublish && canPublish ? (
        <Button variant="primary" onClick={onPublish}>
          Publish
        </Button>
      ) : null}
    </div>
  );
}
