import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Word } from "@/types";

interface DeleteWordDialogProps {
  word: Word | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isDeleting: boolean;
}

export function DeleteWordDialog({
  word,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteWordDialogProps) {
  return (
    <AlertDialog open={!!word} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="arabic-text">
            "{word?.arabic.text}"
          </AlertDialogTitle>
          <AlertDialogDescription>
            This word will be permanently deleted, including its category tags.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => word && onConfirm(word.id)}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
