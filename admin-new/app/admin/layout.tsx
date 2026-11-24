import { Suspense } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { getCurrentUser } from "@/lib/auth/get-current-user";

async function AdminAuthBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = await getCurrentUser();
  return <AdminShell role={role}>{children}</AdminShell>;
}

function AdminLoadingFallback() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-[1280px] space-y-4">
        <div className="h-12 w-64 animate-pulse rounded-xl bg-neutral-bg" />
        <div className="h-96 w-full animate-pulse rounded-2xl bg-white" />
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <AdminAuthBoundary>{children}</AdminAuthBoundary>
    </Suspense>
  );
}
