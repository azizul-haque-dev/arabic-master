import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { StatusBadge } from "@/components/status-badge";
import { fetchCategories } from "@/features/categories/api";
import { fetchSentences, deleteSentence } from "./api";
import { SentenceFormDialog } from "./sentence-form-dialog";
import type { Sentence, Status } from "@/types";

export function SentencesPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<Status | "ALL">("ALL");
  const [categoryId, setCategoryId] = useState<string>("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Sentence | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Sentence | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["sentences", { page, status, categoryId, search: debouncedSearch }],
    queryFn: () =>
      fetchSentences({
        page,
        limit: 15,
        status: status === "ALL" ? undefined : status,
        categoryId: categoryId === "ALL" ? undefined : categoryId,
        search: debouncedSearch || undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSentence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sentences"] });
      toast.success("Sentence deleted");
      setPendingDelete(null);
    },
    onError: () => toast.error("Could not delete this sentence"),
  });

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(sentence: Sentence) {
    setEditing(sentence);
    setFormOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Sentences</h1>
          <p className="text-sm text-muted">Full example sentences built from your word bank.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New sentence
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted" />
          <Input
            placeholder="Search Arabic or meaning…"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={status} onValueChange={(v) => { setStatus(v as Status | "ALL"); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="DISABLED">Disabled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arabic</TableHead>
                  <TableHead>Meaning</TableHead>
                  <TableHead>Words</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((sentence) => (
                  <TableRow key={sentence.id}>
                    <TableCell className="arabic-text max-w-xs text-lg text-ink">{sentence.arabic.text}</TableCell>
                    <TableCell className="max-w-xs text-muted">{sentence.meaningEn}</TableCell>
                    <TableCell className="text-sm text-muted">{sentence.words.length}</TableCell>
                    <TableCell>
                      <StatusBadge status={sentence.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(sentence)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setPendingDelete(sentence)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between border-t border-border p-3">
              <p className="text-xs text-muted">
                Page {data.meta.page} of {data.meta.totalPages} · {data.meta.total} sentences
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPlaceholderData || page >= data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-10 text-center text-sm text-muted">No sentences match these filters.</div>
        )}
      </Card>

      <SentenceFormDialog open={formOpen} onOpenChange={setFormOpen} sentence={editing} />

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="arabic-text">"{pendingDelete?.arabic.text}"</AlertDialogTitle>
            <AlertDialogDescription>This sentence will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
              disabled={deleteMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
