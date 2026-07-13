import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WordsPaginationProps {
  page: number;
  setPage: (page: number | ((p: number) => number)) => void;
  meta: { page: number; totalPages: number; total: number };
  isPlaceholderData: boolean;
}

export function WordsPagination({
  page,
  setPage,
  meta,
  isPlaceholderData,
}: WordsPaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-border p-3">
      <p className="text-xs text-muted">
        Page {meta.page} of {meta.totalPages} · {meta.total} words
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPlaceholderData || page >= meta.totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
