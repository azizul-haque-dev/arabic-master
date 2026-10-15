"use client";

import { ErrorView } from "@/components/shared/error-view";
import "./globals.css";

/**
 * Last-resort boundary for errors thrown in the root layout itself
 * (e.g. getAuthSession failing). It replaces the root layout, so it must
 * render its own <html> and <body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorView error={error} reset={reset} />
      </body>
    </html>
  );
}
