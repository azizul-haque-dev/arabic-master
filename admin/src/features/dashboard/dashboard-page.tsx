import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchArabicTexts } from "@/features/arabic-texts/api";
import { fetchCategories } from "@/features/categories/api";
// Assumed to follow the same { page, limit, search... } -> { items, meta }
// convention as words/sentences/arabic-texts. Adjust these three import
// paths/names if your actual feature api.ts files differ.
import { fetchConversations } from "@/features/conversations/api";
import { fetchTopicConversations } from "@/features/topic-conversations/api";
import { fetchTopics } from "@/features/topics/api";
import { fetchSentences } from "@/features/sentences/api";
import { fetchWords } from "@/features/words/api";
import { useAuthStore } from "@/stores/auth.store";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  BookText,
  FolderTree,
  Languages,
  ListTree,
  MessageSquareText,
  MessagesSquare,
  Tags,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

// Any fetch fn that either returns a plain array (fetchCategories) or a
// paginated { items, meta: { total } } result (everything else) - only the
// count matters here, so both shapes are handled the same way.
type CountSource = () => Promise<{ meta: { total: number } } | unknown[]>;

function useCount(key: string, fn: CountSource) {
  const query = useQuery({ queryKey: [key, "count"], queryFn: fn });
  const value = Array.isArray(query.data)
    ? query.data.length
    : query.data?.meta.total;
  return { value, isLoading: query.isLoading, isError: query.isError };
}

interface StatCardProps {
  label: string;
  to: string;
  icon: LucideIcon;
  value: number | undefined;
  isLoading: boolean;
  isError: boolean;
}

function StatCard({ label, to, icon: Icon, value, isLoading, isError }: StatCardProps) {
  return (
    <Link to={to} className="group block">
      <Card className="h-full transition-colors group-hover:border-accent/40 group-hover:bg-accent-soft/40">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted">{label}</CardTitle>
          <Icon className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-7 w-10 animate-pulse rounded bg-border/60" />
          ) : (
            <p className="text-2xl font-semibold text-ink">
              {isError ? "—" : (value ?? 0).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const words = useCount("words", () => fetchWords({ limit: 1 }));
  const sentences = useCount("sentences", () => fetchSentences({ limit: 1 }));
  const arabicTexts = useCount("arabic-texts", () => fetchArabicTexts({ limit: 1 }));
  const categories = useCount("categories", fetchCategories);

  const topics = useCount("topics", () => fetchTopics({ limit: 1 }));
  const topicConversations = useCount("topic-conversations", () =>
    fetchTopicConversations({ limit: 1 }),
  );
  const conversations = useCount("conversations", () => fetchConversations({ limit: 1 }));
  // No dedicated top-level feature folder for conversation lines (they're
  // managed inline on a conversation's detail page) - if GET
  // /conversation-lines requires a conversationId and can't return an
  // unfiltered total, either add a count endpoint or drop this card.
  const conversationLines = useCount("conversation-lines", () =>
    fetchConversations({ limit: 1 }),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">
          Welcome back{user ? `, ${user.name}` : ""}
        </h1>
        <p className="text-sm text-muted">A quick look at the content library.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Vocabulary
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Words" to="/words" icon={BookText} {...words} />
          <StatCard label="Sentences" to="/sentences" icon={MessageSquareText} {...sentences} />
          <StatCard label="Arabic texts" to="/arabic-texts" icon={Languages} {...arabicTexts} />
          <StatCard label="Categories" to="/categories" icon={Tags} {...categories} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Conversations
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Topics" to="/topics" icon={FolderTree} {...topics} />
          <StatCard
            label="Topic conversations"
            to="/topics"
            icon={ListTree}
            {...topicConversations}
          />
          <StatCard label="Conversations" to="/topics" icon={MessagesSquare} {...conversations} />
          <StatCard
            label="Conversation lines"
            to="/topics"
            icon={BookOpen}
            {...conversationLines}
          />
        </div>
      </section>
    </div>
  );
}