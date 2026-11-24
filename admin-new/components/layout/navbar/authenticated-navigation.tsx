import type { SafeUser } from "@/lib/types/auth";
import type { LearnerOverview } from "@/lib/types/learner";
import { NotificationButton } from "./notification-button";
import { UserProfileMenu } from "./user-profile-menu";
import { UserStats } from "./user-stats";

interface AuthenticatedNavigationProps {
  user: SafeUser;
  overview: LearnerOverview | null;
}

export function AuthenticatedNavigation({
  user,
  overview,
}: AuthenticatedNavigationProps) {
  const xp = overview?.xp ?? 0;
  const streakCount = overview?.streakCount ?? 0;
  const hearts = overview?.hearts ?? 5;
  const plan = overview?.plan ?? "FREE";

  return (
    <div className="hidden items-center gap-2.5 sm:flex">
      <UserStats
        xp={xp}
        streakCount={streakCount}
        hearts={hearts}
        plan={plan}
        compact
        className="hidden xl:inline-flex"
      />
      <NotificationButton
        unreadCount={overview?.unreadNotifications ?? 0}
        notifications={overview?.notifications ?? []}
      />
      <UserProfileMenu user={user} overview={overview} />
    </div>
  );
}
