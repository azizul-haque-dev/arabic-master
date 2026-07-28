import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthBootstrap } from "@/features/auth/auth-bootstrap";
import { router } from "@/routes/router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data in memory only. Persisting an admin cache in localStorage
      // risks showing data from a previous signed-in user.
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      retry: (failureCount, error) => {
        const status = error instanceof AxiosError ? error.response?.status : undefined;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 10_000),
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>
        <RouterProvider router={router} />
        <Toaster />
      </AuthBootstrap>
    </QueryClientProvider>
  );
}
