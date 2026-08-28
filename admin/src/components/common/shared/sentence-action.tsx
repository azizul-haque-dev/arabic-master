import { Sentence } from "@/types";
import { EntityActionMenu } from "./entity-action-menu";
interface SentenceActionMenuProps {
  openEdit: (sentence: Sentence) => void;
  sentence: Sentence;
  openAddMedia: (sentence: Sentence) => void;
  onDelete: (sentence: Sentence) => void;
}

export function SentenceActionMenu({
  openEdit,
  sentence,
  openAddMedia,
  onDelete,
}: SentenceActionMenuProps) {
  return (
    <EntityActionMenu
      actions={[
        { label: "Edit", onClick: () => openEdit(sentence) },
        {
          label: "Delete",
          onClick: () => onDelete(sentence),
          variant: "destructive",
          separatorBefore: true,
        },
        { label: "Add Audio", onClick: () => openAddMedia(sentence) },
      ]}
    />
  );
}
