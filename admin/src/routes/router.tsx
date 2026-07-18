import { AppLayout } from "@/components/layout/app-layout";
import { AiPage } from "@/features/ai/ai-page";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { LoginPage } from "@/features/auth/login-page";
import { CategoriesPage } from "@/features/categories/categories-page";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { MediaPage } from "@/features/media/media-page";
import { SentencesPage } from "@/features/sentences/sentences-page";
import { WordsPage } from "@/features/words/words-page";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/ai", element: <AiPage /> },
          { path: "/words", element: <WordsPage /> },
          { path: "/sentences", element: <SentencesPage /> },
          { path: "/media", element: <MediaPage /> },
          { path: "/categories", element: <CategoriesPage /> },
        ],
      },
    ],
  },
]);
