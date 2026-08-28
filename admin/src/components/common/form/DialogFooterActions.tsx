import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface DialogFooterActionsProps {
  onCancel: () => void;
  isPending: boolean;
  submitText?: string;
  pendingText?: string;
}

export function DialogFooterActions({
  onCancel,
  isPending,
  submitText = "Save",
  pendingText = "Saving…",
}: DialogFooterActionsProps) {
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={isPending}>
        {isPending ? pendingText : submitText}
      </Button>
    </DialogFooter>
  );
}
