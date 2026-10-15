"use client";

import { ErrorView } from "@/components/shared/error-view";

/** Catches errors in any route segment; renders inside the root layout. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorView error={error} reset={reset} />;
}
