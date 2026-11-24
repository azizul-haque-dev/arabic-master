import type { SafeUser } from "@/lib/types/auth";
import type { LearnerOverview } from "@/lib/types/learner";
import { NotificationButton } from "./notification-button";
import { UserProfileMenu } from "./user-profile-menu";

interface AuthenticatedNavigationProps {
  user: SafeUser;
  overview: LearnerOverview | null;
}

export function AuthenticatedNavigation({
  user,
  overview,
}: AuthenticatedNavigationProps) {
  return (
    <div className="hidden items-center gap-2.5 sm:flex">
      <NotificationButton
        unreadCount={overview?.unreadNotifications ?? 0}
        notifications={overview?.notifications ?? []}
      />
      <UserProfileMenu user={user} overview={overview} />
    </div>
  );
}
