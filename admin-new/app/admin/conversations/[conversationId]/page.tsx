import { ConversationDetailView } from "@/components/features/conversations/conversation-detail-view";
import { mockConversations } from "@/lib/mock-data/conversations";
import { notFound } from "next/navigation";

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const conversation = mockConversations.find((c) => c.id === conversationId);

  if (!conversation) {
    notFound();
  }

  return <ConversationDetailView initialConversation={conversation} />;
}
