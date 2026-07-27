import { EllipsisVertical } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Word } from "@/types";

export function DropdownMenuDestructive({
  openEdit,
  word,
  openAddMedia,
  onDelete,
}: {
  openEdit: (word: Word) => void;
  word: Word;
  openAddMedia: (word: Word) => void;
  onDelete: (word: Word) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="your-tailwind-classes">
          <EllipsisVertical />
        </button>
        {/* Or using a custom Button component */}
        {/* <Button variant="outline">Open Menu</Button> */}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <button onClick={() => openEdit(word)}>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </button>
          <DropdownMenuItem onClick={() => openAddMedia(word)}>
            Add Audio
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(word)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
