import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { LoginPage } from "@/features/auth/login-page";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { WordsPage } from "@/features/words/words-page";
import { SentencesPage } from "@/features/sentences/sentences-page";
import { CategoriesPage } from "@/features/categories/categories-page";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/words", element: <WordsPage /> },
          { path: "/sentences", element: <SentencesPage /> },
          { path: "/categories", element: <CategoriesPage /> },
        ],
      },
    ],
  },
]);
