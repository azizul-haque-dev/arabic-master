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
import { fetchTopicConversations } from "@/features/topic-conversations/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import type { ConversationLine } from "@/types/conversation";
import { fetchConversation } from "./api";
import {
  createConversationLine,
  deleteConversationLine,
  updateConversationLine,
} from "@/features/conversation-lines/api";
import {
  ConversationLineFormDialog,
  type LineValues,
} from "./conversation-line-form-dialog";

function axiosMessage(err: unknown, fallback: string) {
  return err instanceof AxiosError
    ? (err.response?.data?.message ?? fallback)
    : fallback;
}

const BUBBLE_COLORS = [
  "bg-accent-soft text-ink",
  "bg-surface text-ink border border-border",
];

export function ConversationBuilderPage() {
  const { topicId = "", tcId = "", conversationId = "" } = useParams();
  const queryClient = useQueryClient();

  const { data: topic } = useQuery({
    queryKey: ["topics", topicId],
    queryFn: () => fetchTopic(topicId),
    enabled: !!topicId,
  });
  const { data: tcList } = useQuery({
    queryKey: ["topic-conversations", topicId],
    queryFn: () => fetchTopicConversations({ topicId, limit: 100 }),
    enabled: !!topicId,
  });
  const topicConversation = tcList?.items.find((tc) => tc.id === tcId);

  const { data: conversation, isLoading } = useQuery({
    queryKey: ["conversations", "detail", conversationId],
    queryFn: () => fetchConversation(conversationId),
    enabled: !!conversationId,
  });

  const lines = useMemo(
    () => [...(conversation?.lines ?? [])].sort((a, b) => a.position - b.position),
    [conversation],
  );

  const speakerOrder = useMemo(() => {
    const order: string[] = [];
    for (const l of lines) if (!order.includes(l.speaker)) order.push(l.speaker);
    return order;
  }, [lines]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<ConversationLine | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ConversationLine | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["conversations", "detail", conversationId] });
    queryClient.invalidateQueries({ queryKey: ["conversations", tcId] });
  }

  const createMutation = useMutation({
    mutationFn: (values: LineValues) => {
      const nextPosition = lines.length
        ? Math.max(...lines.map((l) => l.position)) + 1
        : 0;
      return createConversationLine({
        conversationId,
        sentenceId: values.sentenceId,
        speaker: values.speaker,
        position: nextPosition,
        meaningEn: values.meaningEn || undefined,
        meaningBn: values.meaningBn || undefined,
      });
    },
    onSuccess: () => {
      invalidate();
      toast.success("Line added");
      setFormOpen(false);
    },
    onError: (err) => toast.error(axiosMessage(err, "Could not add this line")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: LineValues }) =>
      updateConversationLine(id, {
        sentenceId: values.sentenceId,
        speaker: values.speaker,
        meaningEn: values.meaningEn || undefined,
        meaningBn: values.meaningBn || undefined,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Line updated");
      setFormOpen(false);
      setEditingLine(null);
    },
    onError: (err) => toast.error(axiosMessage(err, "Could not update this line")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteConversationLine,
    onSuccess: () => {
      invalidate();
      toast.success("Line removed");
      setPendingDelete(null);
    },
    onError: () => toast.error("Could not remove this line"),
  });

  // Swap two adjacent lines' positions. Routed through a temporary negative
  // position first since [conversationId, position] is unique and each PATCH
  // is its own request/transaction — a direct swap would collide mid-flight.
  async function move(index: number, direction: -1 | 1) {
    const current = lines[index];
    const other = lines[index + direction];
    if (!current || !other) return;

    setReorderingId(current.id);
    try {
      await updateConversationLine(current.id, { position: -1 });
      await updateConversationLine(other.id, { position: current.position });
      await updateConversationLine(current.id, { position: other.position });
      invalidate();
    } catch {
      toast.error("Could not reorder lines");
      invalidate();
    } finally {
      setReorderingId(null);
    }
  }

  function handleSubmit(values: LineValues) {
    if (editingLine) updateMutation.mutate({ id: editingLine.id, values });
    else createMutation.mutate(values);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <BreadcrumbNav
        items={[
          { label: "Conversations", to: "/topics" },
          { label: topic?.titleEn ?? "…", to: `/topics/${topicId}` },
          {
            label: topicConversation?.titleEn ?? "…",
            to: `/topics/${topicId}/topic-conversations/${tcId}`,
          },
          { label: "Conversation" },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Conversation lines</h1>
          <p className="text-sm text-muted">
            Build the exchange line by line, in the order learners will hear it.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingLine(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add line
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-3/4" />
          ))}
        </div>
      ) : lines.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted">
          No lines yet. Add the first line to start this conversation.
        </Card>
      ) : (
        <div className="space-y-3">
          {lines.map((line, index) => {
            const speakerIdx = speakerOrder.indexOf(line.speaker) % 2;
            const alignRight = speakerIdx === 1;
            const meaningEn = line.meaningEn || line.sentence.meaningEn;
            const isBusy = reorderingId === line.id;

            return (
              <div
                key={line.id}
                className={`flex items-start gap-2 ${alignRight ? "flex-row-reverse" : ""}`}
              >
                <div className="flex shrink-0 flex-col items-center gap-1 pt-1">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                    {line.speaker.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-6"
                      disabled={index === 0 || isBusy}
                      onClick={() => move(index, -1)}
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-6"
                      disabled={index === lines.length - 1 || isBusy}
                      onClick={() => move(index, 1)}
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${BUBBLE_COLORS[speakerIdx] ?? BUBBLE_COLORS[0]} ${isBusy ? "opacity-50" : ""}`}
                >
                  <div
                    className={`mb-1 flex items-center gap-2 text-xs font-medium text-muted ${alignRight ? "flex-row-reverse" : ""}`}
                  >
                    <span>{line.speaker}</span>
                    <span className="text-border">·</span>
                    <span>#{index + 1}</span>
                  </div>
                  <p className="arabic-text text-lg leading-snug">
                    {line.sentence.arabic.text}
                  </p>
                  {meaningEn && (
                    <p className="mt-1 text-sm text-muted">{meaningEn}</p>
                  )}

                  <div
                    className={`mt-2 flex gap-1 ${alignRight ? "justify-end" : ""}`}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingLine(line);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setPendingDelete(line)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConversationLineFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingLine(null);
        }}
        onSubmit={handleSubmit}
        isSaving={createMutation.isPending || updateMutation.isPending}
        line={editingLine}
        knownSpeakers={speakerOrder}
      />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this line?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.sentence.arabic.text}" will be removed from this
              conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
              disabled={deleteMutation.isPending}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
