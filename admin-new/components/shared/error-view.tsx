"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Home, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorViewProps {
  error: Error & { digest?: string };
  /** Re-renders the failed segment. Omit to hide the "Try again" button. */
  reset?: () => void;
  title?: string;
  description?: string;
  /** Where "Go back" falls back to when there is no browser history. */
  fallbackHref?: string;
}

export function ErrorView({
  error,
  reset,
  title = "Something went wrong",
  description = "একটা সমস্যা হয়েছে। আবার চেষ্টা করো অথবা আগের পেজে ফিরে যাও।",
  fallbackHref = "/",
}: ErrorViewProps) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  function handleBack() {
    // A direct visit (new tab / bookmark) has no history to go back to.
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  }

  return (
    <div
      role="alert"
      className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-5 px-4 py-12 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-bg">
        <AlertTriangle className="h-8 w-8 text-error-text" aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-xl font-semibold text-text">{title}</h1>
        <p className="max-w-md text-sm text-text-secondary">{description}</p>
        {error.digest ? (
          <p className="text-xs text-text-muted">
            Error ID: <code className="font-mono">{error.digest}</code>
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button id="error-go-back" variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Go back
        </Button>
        {reset ? (
          <Button id="error-try-again" onClick={reset}>
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
        ) : null}
        <Button id="error-go-home" variant="ghost" onClick={() => router.push("/")}>
          <Home className="h-4 w-4" aria-hidden="true" />
          Home
        </Button>
      </div>
    </div>
  );
}
