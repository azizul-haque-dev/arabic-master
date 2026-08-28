import { Word } from "@/types";
import { EntityActionMenu } from "./entity-action-menu";
interface WordActionMenuProps {
  openEdit: (word: Word) => void;
  word: Word;
  openAddMedia: (word: Word) => void;
  onDelete: (word: Word) => void;
}
export function WordActionMenu({
  openEdit,
  word,
  openAddMedia,
  onDelete,
}: WordActionMenuProps) {
  return (
    <EntityActionMenu
      actions={[
        { label: "Edit", onClick: () => openEdit(word) },
        { label: "Add Audio", onClick: () => openAddMedia(word) },
        {
          label: "Delete",
          onClick: () => onDelete(word),
          variant: "destructive",
          separatorBefore: true,
        },
      ]}
    />
  );
}
