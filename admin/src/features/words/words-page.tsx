import { DeleteWordDialog } from "@/components/words/delete-word-dialog";
import { WordsFilters } from "@/components/words/words-filters";
import { WordsHeader } from "@/components/words/words-header";
import { WordsPagination } from "@/components/words/words-pagination";
import { WordsTable } from "@/components/words/words-table";
import { fetchCategories } from "@/features/categories/api";
import type { Status, Word } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AudioUploadDialog } from "@/components/common/add-word-audio";
import { deleteWord, fetchWords } from "./api";
import { WordFormDialog } from "./word-form-dialog";

export function WordsPage() {
  const queryClient = useQueryClient();

  // State management
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<Status | "ALL">("ALL");
  const [categoryId, setCategoryId] = useState<string>("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Word | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Word | null>(null);
  const [wordData, setWordData] = useState<Word | null>(null);
  const [audioFormOpen, setAudioFormOpen] = useState(false);

  // Debounce free-text search to prevent excessive API calls
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  // Data fetching
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["words", { page, status, categoryId, search: debouncedSearch }],
    queryFn: () =>
      fetchWords({
        page,
        limit: 15,
        status: status === "ALL" ? undefined : status,
        categoryId: categoryId === "ALL" ? undefined : categoryId,
        search: debouncedSearch || undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["words"] });
      toast.success("Word deleted");
      setPendingDelete(null);
    },
    onError: () => toast.error("Could not delete this word"),
  });

  // Handlers
  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (word: Word) => {
    setEditing(word);
    setFormOpen(true);
    console.log(word);
  };
  const openAddMedia = (word: Word) => {
    setAudioFormOpen(true);
    setWordData(word);
  };
  const closeMediaDialog = () => {
    setAudioFormOpen(!audioFormOpen);
    setWordData(null);
  };
  return (
    <div className="space-y-5">
      <WordsHeader onOpenCreate={openCreate} />

      <WordsFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        categoryId={categoryId}
        onCategoryChange={(v) => {
          setCategoryId(v);
          setPage(1);
        }}
        categories={categories}
      />

      <div className="flex flex-col rounded-xl border border-border bg-card text-card-foreground shadow">
        <WordsTable
          isLoading={isLoading}
          words={data?.items || []}
          openEdit={openEdit}
          openAddMedia={openAddMedia}
        />

        {data?.meta && (
          <WordsPagination
            page={page}
            setPage={setPage}
            meta={data.meta}
            isPlaceholderData={isPlaceholderData}
          />
        )}
      </div>
      <WordFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditing(null);
          }
        }}
        word={editing}
      />

      {wordData && wordData?.arabicId && (
        <AudioUploadDialog
          word={wordData}
          queryKeyToInvalidate={["words"]}
          onOpenChange={closeMediaDialog}
        />
      )}

      <DeleteWordDialog
        word={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={(id: string) => deleteMutation.mutate(id)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
