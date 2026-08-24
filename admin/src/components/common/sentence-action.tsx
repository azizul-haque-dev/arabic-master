import { EllipsisVertical } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Sentence } from "@/types";

interface SentenceActionMenuProps {
  openEdit: (sentence: Sentence) => void;
  sentence: Sentence;
  onDelete: (sentence: Sentence) => void;
}

export function SentenceActionMenu({
  openEdit,
  sentence,
  onDelete,
}: SentenceActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="your-tailwind-classes">
          <EllipsisVertical />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <button onClick={() => openEdit(sentence)}>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </button>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(sentence)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
