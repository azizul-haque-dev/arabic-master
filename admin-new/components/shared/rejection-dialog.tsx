"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function RejectionDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject this entity</DialogTitle>
          <DialogDescription>
            Explain what needs to change. This is shown to the content creator.
          </DialogDescription>
        </DialogHeader>

        <Label htmlFor="rejection-reason">Reason for rejection</Label>
        <textarea
          id="rejection-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="e.g. English pronunciation needs correction."
          className="w-full rounded-default border border-border-strong p-3 text-sm focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
        />

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="border border-error/30"
            disabled={!reason.trim()}
            onClick={() => {
              onSubmit(reason.trim());
              setReason("");
              onOpenChange(false);
            }}
          >
            Reject with reason
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
