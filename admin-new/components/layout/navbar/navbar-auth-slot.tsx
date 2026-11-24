import { getAuthSession } from "@/lib/auth/session";
import { getLearnerOverview } from "@/lib/data/learner";
import { NavbarAuthClient } from "./navbar-auth-client";

export async function NavbarAuthSlot() {
  const [{ user }, overview] = await Promise.all([
    getAuthSession(),
    getLearnerOverview(),
  ]);

  return (
    <NavbarAuthClient
      initialUser={user ?? null}
      initialOverview={user ? overview : null}
    />
  );
}
