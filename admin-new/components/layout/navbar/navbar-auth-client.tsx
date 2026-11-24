"use client";

import { useEffect } from "react";
import { useUser } from "@/lib/auth/user-context";
import type { SafeUser } from "@/lib/types/auth";
import type { LearnerOverview } from "@/lib/types/learner";
import { AuthenticatedNavigation } from "./authenticated-navigation";
import { GuestNavigation } from "./guest-navigation";
import { MobileNavigation } from "./mobile-navigation";

interface NavbarAuthClientProps {
  initialUser: SafeUser | null;
  initialOverview: LearnerOverview | null;
}

export function NavbarAuthClient({
  initialUser,
  initialOverview,
}: NavbarAuthClientProps) {
  const { user, overview, hasClientOverride, resetClientOverride, setOverview } =
    useUser();

  useEffect(() => {
    if (hasClientOverride) {
      const serverMatchesClient =
        (initialUser?.id ?? null) === (user?.id ?? null);
      if (serverMatchesClient) {
        resetClientOverride();
        setOverview(initialOverview);
      }
    } else {
      setOverview(initialOverview);
    }
  }, [initialUser, initialOverview, hasClientOverride, user?.id, resetClientOverride, setOverview]);

  const activeUser = hasClientOverride ? user : initialUser;
  const activeOverview = hasClientOverride ? overview : initialOverview;

  return (
    <div className="flex items-center gap-2 lg:justify-self-end">
      {activeUser ? (
        <AuthenticatedNavigation user={activeUser} overview={activeOverview} />
      ) : (
        <GuestNavigation />
      )}
      <MobileNavigation user={activeUser} overview={activeOverview} />
    </div>
  );
}
