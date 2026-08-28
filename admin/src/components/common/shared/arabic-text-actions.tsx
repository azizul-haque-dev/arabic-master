import { ArabicTextEntry } from "@/types";
import { EntityActionMenu } from "./entity-action-menu";

interface ArabicTextActionsProps {
  onEdit: (arabicText: ArabicTextEntry) => void;
  arabicText: ArabicTextEntry;
  openAddMedia: (arabicText: ArabicTextEntry) => void;
  onDelete: (arabicText: ArabicTextEntry) => void;
}

export function ArabicTextActions({
  arabicText,
  onEdit,
  openAddMedia,
  onDelete,
}: ArabicTextActionsProps) {
  return (
    <EntityActionMenu
      actions={[
        { label: "Edit", onClick: () => onEdit(arabicText) },
        { label: "Add Audio", onClick: () => openAddMedia(arabicText) },
        {
          label: "Delete",
          onClick: () => onDelete(arabicText),
          variant: "destructive",
          separatorBefore: true,
        },
      ]}
    />
  );
}
