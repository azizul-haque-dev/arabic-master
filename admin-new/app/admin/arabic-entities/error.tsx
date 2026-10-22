"use client";

import { ErrorView } from "@/components/shared/error-view";

export default function ArabicEntitiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorView
      error={error}
      reset={reset}
      title="Unable to load Arabic entities"
      description="অ্যারাবিক এন্টিটি লোড করার সময় একটি সমস্যা দেখা দিয়েছে। আবার চেষ্টা করুন অথবা রিফ্রেশ করুন।"
      fallbackHref="/admin/arabic-entities"
    />
  );
}
