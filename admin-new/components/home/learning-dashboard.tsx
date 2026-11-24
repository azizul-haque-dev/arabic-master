import { Suspense } from "react";
import { getAuthSession } from "@/lib/auth/session";
import { getLearnerOverview } from "@/lib/data/learner";
import { LearningDashboardClient } from "./learning-dashboard-client";

async function LearningDashboardSlot() {
  const [{ user }, overview] = await Promise.all([
    getAuthSession(),
    getLearnerOverview(),
  ]);

  return (
    <LearningDashboardClient
      initialUser={user ?? null}
      initialOverview={user ? overview : null}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div
      className="h-60 w-full animate-pulse rounded-3xl border border-border/70 bg-white"
      aria-hidden="true"
    />
  );
}

export function LearningDashboardSection() {
  return (
    <section id="learning-dashboard" className="mx-auto -mt-2 max-w-container-max px-4 pb-10 sm:px-6 lg:px-8">
      <Suspense fallback={<DashboardSkeleton />}>
        <LearningDashboardSlot />
      </Suspense>
    </section>
  );
}
