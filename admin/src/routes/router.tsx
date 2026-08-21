import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { LoginPage } from "@/features/auth/login-page";
import { CategoriesPage } from "@/features/categories/categories-page";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { MediaPage } from "@/features/media/media-page";
import { SentencesPage } from "@/features/sentences/sentences-page";
import { WordsPage } from "@/features/words/words-page";
import { createBrowserRouter } from "react-router-dom";
import { ArabicTextsPage } from "@/features/arabic-texts/arabic-texts-page";
import { TopicsPage } from "@/features/topics/topics-page";
import { TopicConversationsPage } from "@/features/topic-conversations/topic-conversations-page";
import { ConversationsPage } from "@/features/conversations/conversations-page";
import { ConversationBuilderPage } from "@/features/conversations/conversation-builder-page";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/arabic-texts", element: <ArabicTextsPage /> },
          { path: "/words", element: <WordsPage /> },
          { path: "/sentences", element: <SentencesPage /> },
          { path: "/media", element: <MediaPage /> },
          { path: "/categories", element: <CategoriesPage /> },
          { path: "/topics", element: <TopicsPage /> },
          { path: "/topics/:topicId", element: <TopicConversationsPage /> },
          {
            path: "/topics/:topicId/topic-conversations/:tcId",
            element: <ConversationsPage />,
          },
          {
            path: "/topics/:topicId/topic-conversations/:tcId/conversations/:conversationId",
            element: <ConversationBuilderPage />,
          },
        ],
      },
    ],
  },
]);
