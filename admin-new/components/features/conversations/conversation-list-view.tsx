"use client";

import { ConversationMetaDialog } from "@/components/features/conversations/conversation-meta-dialog";
import {
  ContentDataTable,
  type DataTableColumn,
} from "@/components/shared/content-data-table";
import { ContentStatusFilter } from "@/components/shared/content-filters";
import { ContentPageHeader } from "@/components/shared/content-page-header";
import { ContentSearch } from "@/components/shared/content-search";
import { ContentStatusBadge } from "@/components/shared/content-status-badge";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { mockConversations } from "@/lib/mock-data/conversations";
import { useRole } from "@/lib/role-context";
import type {
  ContentStatus,
  Conversation,
  ConversationMetaFormValues,
} from "@/lib/types/content";
import { MessagesSquare, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function ConversationListView() {
  const router = useRouter();
  const { role } = useRole();

  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<ContentStatus>>(
    new Set(),
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      const matchesStatus =
        statusFilter.size === 0 || statusFilter.has(c.status);
      const needle = search.trim().toLowerCase();
      const matchesSearch =
        !needle ||
        c.title.toLowerCase().includes(needle) ||
        c.topic.toLowerCase().includes(needle) ||
        c.conversationKey.toLowerCase().includes(needle);
      return matchesStatus && matchesSearch;
    });
  }, [conversations, search, statusFilter]);

  function handleCreate(values: ConversationMetaFormValues) {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      conversationKey: `CNV-${3000 + conversations.length + 1}`,
      ...values,
      turns: [],
      status: "DRAFT",
      createdBy: role === "ADMIN" ? "You (Admin)" : "You (Content Manager)",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConversation, ...prev]);
    router.push(`/admin/conversations/${newConversation.id}`);
  }

  function handleDelete(conversation: Conversation) {
    setConversations((prev) => prev.filter((c) => c.id !== conversation.id));
  }

  const columns: DataTableColumn<Conversation>[] = [
    {
      key: "title",
      header: "Conversation",
      cell: (c) => (
        <div>
          <p className="font-medium text-[var(--color-text)]">{c.title}</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {c.conversationKey}
          </p>
        </div>
      ),
    },
    {
      key: "topic",
      header: "Topic",
      cell: (c) => (
        <span className="text-[var(--color-text-secondary)]">{c.topic}</span>
      ),
    },
    {
      key: "turns",
      header: "Sentences",
      cell: (c) => (
        <span className="text-xs text-[var(--color-text-muted)]">
          {c.turns.length} sentence{c.turns.length !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      key: "lesson",
      header: "Lesson",
      cell: (c) => (
        <span className="text-xs text-[var(--color-text-muted)]">
          {c.lessonName ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => <ContentStatusBadge status={c.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (c) => (
        <div
          className="flex justify-end gap-1"
          onClick={(ev) => ev.stopPropagation()}
        >
          {role === "ADMIN" ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${c.conversationKey}`}
              onClick={() => setDeleteTarget(c)}
            >
              <Trash2 className="h-4 w-4 text-[var(--color-text-muted)]" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <ContentPageHeader
        title="Conversations"
        description="Real-world dialogues built from sentences — never built directly from Arabic entities."
        primaryAction={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create conversation
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <ContentSearch
            value={search}
            onChange={setSearch}
            placeholder="Search title, topic, or ID..."
          />
          <ContentStatusFilter
            selected={statusFilter}
            onChange={setStatusFilter}
            options={[
              "DRAFT",
              "IN_REVIEW",
              "APPROVED",
              "PUBLISHED",
              "REJECTED",
              "ARCHIVED",
            ]}
          />
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          {filtered.length}{" "}
          {filtered.length === 1 ? "conversation" : "conversations"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="No conversations yet"
          description="Create your first conversation to start building real-world Arabic practice."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create conversation
            </Button>
          }
        />
      ) : (
        <ContentDataTable
          columns={columns}
          rows={filtered}
          rowKey={(c) => c.id}
          onRowClick={(c) => router.push(`/conversations/${c.id}`)}
          renderMobileCard={(c) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-[var(--color-text)]">
                    {c.title}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {c.conversationKey}
                  </p>
                </div>
                <ContentStatusBadge status={c.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                <span>{c.topic}</span>
                <span>{c.turns.length} sentences</span>
              </div>
            </div>
          )}
        />
      )}

      <ConversationMetaDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={handleCreate}
      />

      <DeleteConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this conversation?"
        description="This action cannot be undone."
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </div>
  );
}
