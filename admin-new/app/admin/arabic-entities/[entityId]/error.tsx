"use client";

import { ErrorView } from "@/components/shared/error-view";

export default function ArabicEntityDetailError({
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
      title="Unable to load Arabic entity detail"
      description="অ্যারাবিক এন্টিটির বিস্তারিত তথ্য লোড করার সময় সমস্যা হয়েছে। আবার চেষ্টা করুন অথবা আগের পেজে ফিরে যান।"
      fallbackHref="/admin/arabic-entities"
    />
  );
}
