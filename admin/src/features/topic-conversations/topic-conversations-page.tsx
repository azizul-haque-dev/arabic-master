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
import { Skeleton } from "@/components/ui/skeleton";
import { BreadcrumbNav } from "@/components/common/breadcrumb-nav";
import { fetchTopic } from "@/features/topics/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, MessageSquareText, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { TopicConversation } from "@/types/conversation";
import { deleteTopicConversation, fetchTopicConversations } from "./api";
import { TopicConversationFormDialog } from "./topic-conversation-form-dialog";

export function TopicConversationsPage() {
  const { topicId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TopicConversation | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TopicConversation | null>(null);

  const { data: topic, isLoading: topicLoading } = useQuery({
    queryKey: ["topics", topicId],
    queryFn: () => fetchTopic(topicId),
    enabled: !!topicId,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["topic-conversations", topicId],
    queryFn: () => fetchTopicConversations({ topicId, limit: 100 }),
    enabled: !!topicId,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTopicConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topic-conversations", topicId] });
      toast.success("Conversation set deleted");
      setPendingDelete(null);
    },
    onError: () => toast.error("Could not delete this conversation set"),
  });

  const items = data?.items ?? [];

  return (
    <div className="space-y-5">
      <BreadcrumbNav
        items={[
          { label: "Conversations", to: "/topics" },
          { label: topicLoading ? "…" : (topic?.titleEn ?? "Topic") },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">
            {topicLoading ? <Skeleton className="h-6 w-40" /> : topic?.titleEn}
          </h1>
          <p className="text-sm text-muted">
            Conversation sets under this topic.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          New conversation set
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted">
          No conversation sets yet under this topic.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((tc) => (
            <Card
              key={tc.id}
              onClick={() => navigate(`/topics/${topicId}/topic-conversations/${tc.id}`)}
              className="group flex cursor-pointer flex-col justify-between gap-3 p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-medium text-ink">{tc.titleEn}</h3>
                  {tc.titleBn && (
                    <p className="truncate text-sm text-muted">{tc.titleBn}</p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-border group-hover:text-accent" />
              </div>

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                  <MessageSquareText className="h-3.5 w-3.5" />
                  {tc.conversationCount ?? "—"} conversations
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(tc);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDelete(tc);
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

      <TopicConversationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        topicId={topicId}
        topicConversation={editing}
      />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{pendingDelete?.titleEn}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes every conversation and line inside this set. This can't
              be undone.
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
