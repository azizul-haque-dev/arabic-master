import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { showErrorToast } from "./toast";

// TanStack Query v5's way of typing custom `meta` fields
declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: { suppressGlobalError?: boolean };
    mutationMeta: { suppressGlobalError?: boolean };
  }
}

const NON_RETRYABLE_STATUS_CODES = new Set([400, 401, 403, 404, 409, 422]);

function shouldRetry(failureCount: number, error: unknown) {
  if (failureCount >= 3) return false;

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    // no response at all = network/timeout error — worth retrying
    if (!status) return true;
    // client errors (4xx) will fail identically on retry — don't waste
    // battery/time hammering an endpoint that's never going to succeed
    if (NON_RETRYABLE_STATUS_CODES.has(status)) return false;
    // 5xx = likely transient server issue, retry
    return status >= 500;
  }

  return true;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const serverMessage = (
      error.response?.data as { message?: string } | undefined
    )?.message;
    return serverMessage ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry, // default retryDelay (exponential backoff) is fine, not overridden
      staleTime: 60 * 1000, // 1 min — avoids refetch spam when re-visiting a screen
      gcTime: 5 * 60 * 1000, // 5 min — keeps cache warm briefly for back-navigation
      refetchOnReconnect: true,
      // RN has no "window focus" concept the way web does — leave off
      // rather than cargo-culting a web default that does nothing here
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: shouldRetry,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // if the screen already has cached data, a background refetch
      // failure shouldn't interrupt the user with a toast
      if (query.state.data !== undefined) return;
      if (query.meta?.suppressGlobalError) return;
      showErrorToast(getErrorMessage(error));
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.suppressGlobalError) return;
      showErrorToast(getErrorMessage(error));
    },
  }),
});
