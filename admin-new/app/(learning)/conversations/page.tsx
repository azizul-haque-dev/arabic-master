import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { LearningGridSkeleton } from "@/components/learning/learning-grid-skeleton";
import { LearningPageHeader } from "@/components/learning/learning-page-header";
import { getPublicConversations } from "@/lib/data/public-content";

export const metadata: Metadata = {
  title: "Conversations — Real-Life Arabic Dialogues",
  description:
    "Build speaking confidence through guided two-way spoken Arabic dialogues for everyday situations.",
};

interface ConversationsPageProps {
  searchParams?: Promise<{ page?: string }>;
}

async function ConversationsCatalog({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const page = Math.max(1, Number(params.page) || 1);
  const { items } = await getPublicConversations({ page, limit: 18 });

  return (
    <div className="mx-auto max-w-container-max px-4 py-10 sm:px-6 lg:px-8">
      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-10 text-center">
          <p className="font-heading text-lg font-semibold text-text">
            No published conversations available yet
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Explore our courses or create a free account to stay updated as
            new real-life dialogues are released.
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <span>Browse Courses</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((conv) => (
            <article
              key={conv.id}
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-white p-6 shadow-2xs transition-shadow hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
                    {conv.category}
                  </span>
                  <span className="text-xs font-medium text-text-muted">
                    {conv.turnCount} turns
                  </span>
                </div>
                <h2 className="mt-3 font-heading text-lg font-bold text-text">
                  {conv.title}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">{conv.topic}</p>
              </div>
              <div className="mt-5 border-t border-border/70 pt-3">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  <span>Practice in Courses</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConversationsPage({
  searchParams,
}: ConversationsPageProps) {
  return (
    <div>
      <LearningPageHeader
        badge="Real-Life Dialogues"
        title="Guided Arabic Conversations"
        description="Practice realistic everyday conversations step by step so you can speak naturally with locals and colleagues."
        icon={MessagesSquare}
      />
      <Suspense fallback={<LearningGridSkeleton />}>
        <ConversationsCatalog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
