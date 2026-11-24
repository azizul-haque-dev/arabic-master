import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ConversationDetailView } from "@/components/features/conversations/conversation-detail-view";
import { mockConversations } from "@/lib/mock-data/conversations";
import Loading from "./loading";

async function ConversationDetailData({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  await connection();
  const { conversationId } = await params;
  const conversation = mockConversations.find((c) => c.id === conversationId);

  if (!conversation) {
    notFound();
  }

  return <ConversationDetailView initialConversation={conversation} />;
}

export default function ConversationDetailPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <ConversationDetailData params={params} />
    </Suspense>
  );
}
