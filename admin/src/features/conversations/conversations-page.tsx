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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BreadcrumbNav } from "@/components/common/breadcrumb-nav";
import { fetchTopic } from "@/features/topics/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { Conversation } from "@/types/conversation";
import { fetchTopicConversations } from "@/features/topic-conversations/api";
import { createConversation, deleteConversation, fetchConversations } from "./api";

export function ConversationsPage() {
  const { topicId = "", tcId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [pendingDelete, setPendingDelete] = useState<Conversation | null>(null);

  const { data: topic } = useQuery({
    queryKey: ["topics", topicId],
    queryFn: () => fetchTopic(topicId),
    enabled: !!topicId,
  });

  // Reuse the list endpoint filtered to this topic to resolve the current
  // conversation set's title for the breadcrumb without a dedicated getOne call.
  const { data: tcList } = useQuery({
    queryKey: ["topic-conversations", topicId],
    queryFn: () => fetchTopicConversations({ topicId, limit: 100 }),
    enabled: !!topicId,
  });
  const topicConversation = tcList?.items.find((tc) => tc.id === tcId);

  const { data, isLoading } = useQuery({
    queryKey: ["conversations", tcId],
    queryFn: () => fetchConversations({ topicConversationId: tcId, limit: 100 }),
    enabled: !!tcId,
  });

  const createMutation = useMutation({
    mutationFn: () => createConversation(tcId),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations", tcId] });
      navigate(
        `/topics/${topicId}/topic-conversations/${tcId}/conversations/${conversation.id}`,
      );
    },
    onError: () => toast.error("Could not create a new conversation"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", tcId] });
      toast.success("Conversation deleted");
      setPendingDelete(null);
    },
    onError: () => toast.error("Could not delete this conversation"),
  });

  const items = data?.items ?? [];

  return (
    <div className="space-y-5">
      <BreadcrumbNav
        items={[
          { label: "Conversations", to: "/topics" },
          { label: topic?.titleEn ?? "…", to: `/topics/${topicId}` },
          { label: topicConversation?.titleEn ?? "…" },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">
            {topicConversation?.titleEn ?? <Skeleton className="h-6 w-40" />}
          </h1>
          <p className="text-sm text-muted">
            Individual conversations built line by line from your sentence bank.
          </p>
        </div>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          <Plus className="h-4 w-4" />
          {createMutation.isPending ? "Creating…" : "New conversation"}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted">
          No conversations yet. Create one to start adding lines.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((conversation, i) => {
            const sortedLines = [...conversation.lines].sort(
              (a, b) => a.position - b.position,
            );
            const firstLine = sortedLines[0];
            const speakers = Array.from(new Set(sortedLines.map((l) => l.speaker)));

            return (
              <Card
                key={conversation.id}
                onClick={() =>
                  navigate(
                    `/topics/${topicId}/topic-conversations/${tcId}/conversations/${conversation.id}`,
                  )
                }
                className="group flex cursor-pointer flex-col justify-between gap-3 p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted">
                    Conversation {i + 1}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-border group-hover:text-accent" />
                </div>

                {firstLine ? (
                  <p className="arabic-text line-clamp-2 text-base text-ink">
                    {firstLine.sentence.arabic.text}
                  </p>
                ) : (
                  <p className="text-sm italic text-muted">No lines added yet</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">{sortedLines.length} lines</Badge>
                    {speakers.slice(0, 2).map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDelete(conversation);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              All of its lines will be permanently deleted. This can't be undone.
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
