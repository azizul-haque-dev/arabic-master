import { DropdownMenuDestructive } from "@/components/common/word-action";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Word } from "@/types";

interface WordsTableProps {
  isLoading: boolean;
  words: Word[];
  openEdit: (word: Word) => void;
  openAddMedia: (word: Word) => void;
  onDelete: (word: Word) => void;
}

export function WordsTable({
  isLoading,
  words,
  openEdit,
  openAddMedia,
  onDelete,
}: WordsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!words.length) {
    return (
      <div className="p-10 text-center text-sm text-muted">
        No words match these filters.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Arabic</TableHead>
          <TableHead>Meaning</TableHead>
          <TableHead>Categories</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {words.map((word) => (
          <TableRow key={word.id}>
            <TableCell className="arabic-text text-lg text-ink">
              {word.arabic.text}
            </TableCell>
            <TableCell className="text-muted">
              {word.meaningEn || "—"}
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {word.categories.map((c) => (
                  <span
                    key={c.id}
                    className="rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent"
                  >
                    {c.nameEn}
                  </span>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge status={word.status} />
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenuDestructive
                openEdit={() => openEdit(word)}
                openAddMedia={() => openAddMedia(word)}
                onDelete={onDelete}
                word={word}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
