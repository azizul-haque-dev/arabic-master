import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ArabicTextEntry } from "@/types";
import { EllipsisVertical } from "lucide-react";

interface ArabicTextActionsProps {
  arabicText: ArabicTextEntry;
  onEdit: (arabicText: ArabicTextEntry) => void;
  onAddAudio: (arabicText: ArabicTextEntry) => void;
  onDelete: (arabicText: ArabicTextEntry) => void;
}

export function ArabicTextActions({
  arabicText,
  onEdit,
  onAddAudio,
  onDelete,
}: ArabicTextActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <EllipsisVertical className="h-4 w-4" />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onEdit(arabicText)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAddAudio(arabicText)}>
            Add Audio
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(arabicText)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
