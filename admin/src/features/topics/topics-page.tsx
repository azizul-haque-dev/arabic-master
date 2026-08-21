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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, MessageSquareText, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Topic } from "@/types/conversation";
import { deleteTopic, fetchTopics } from "./api";
import { TopicFormDialog } from "./topic-form-dialog";

export function TopicsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Topic | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["topics", { search: debouncedSearch }],
    queryFn: () => fetchTopics({ search: debouncedSearch || undefined, limit: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast.success("Topic deleted");
      setPendingDelete(null);
    },
    onError: () => toast.error("Could not delete this topic"),
  });

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(e: React.MouseEvent, topic: Topic) {
    e.stopPropagation();
    setEditing(topic);
    setFormOpen(true);
  }

  const topics = data?.items ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Conversations</h1>
          <p className="text-sm text-muted">
            Topics group conversation sets that learners browse by subject.
          </p>
        </div>
        <Button onClick={openCreate} className="sm:w-auto">
          <Plus className="h-4 w-4" />
          New topic
        </Button>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted" />
        <Input
          placeholder="Search topics…"
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted">
          No topics yet. Create one to start building conversations.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              onClick={() => navigate(`/topics/${topic.id}`)}
              className="group flex cursor-pointer flex-col justify-between gap-3 p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-medium text-ink">{topic.titleEn}</h3>
                  {topic.titleBn && (
                    <p className="arabic-text-none truncate text-sm text-muted">
                      {topic.titleBn}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-border group-hover:text-accent" />
              </div>

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                  <MessageSquareText className="h-3.5 w-3.5" />
                  {topic.conversationCount ?? "—"} conversation sets
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => openEdit(e, topic)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDelete(topic);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <TopicFormDialog open={formOpen} onOpenChange={setFormOpen} topic={editing} />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{pendingDelete?.titleEn}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes every conversation set, conversation and line under this
              topic. This can't be undone.
            </AlertDialogDescription>
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
