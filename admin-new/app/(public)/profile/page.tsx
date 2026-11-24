import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen,
  CheckCircle,
  Crown,
  Flame,
  Heart,
  Key,
  LayoutDashboard,
  LogOut,
  Mail,
  Shield,
  Star,
  User as UserIcon,
} from "lucide-react";
import { logoutAction } from "@/actions/auth/logout-action";
import { getAuthSession } from "@/lib/auth/session";
import { getLearnerOverview } from "@/lib/data/learner";

export const metadata = {
  title: "My Profile - Arabic Master",
  description: "View and manage your Arabic Master account details",
};

function getInitials(name?: string, email?: string): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.length > 0) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
}

async function ProfileContent() {
  const [{ user }, overview] = await Promise.all([
    getAuthSession(),
    getLearnerOverview(),
  ]);

  if (!user) {
    redirect("/login");
  }

  const rawName =
    typeof user.fullName === "string"
      ? user.fullName
      : typeof user.name === "string"
        ? user.name
        : undefined;
  const rawEmail = typeof user.email === "string" ? user.email : undefined;
  const displayName = rawName || (rawEmail ? rawEmail.split("@")[0] : "User");
  const initials = getInitials(rawName, rawEmail);
  const isAdmin = user.role === "ADMIN" || user.role === "CONTENT_MANAGER";
  const xp = overview?.xp ?? 0;
  const streakCount = overview?.streakCount ?? 0;
  const hearts = overview?.hearts ?? 5;
  const plan = overview?.plan ?? "FREE";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-white p-6 shadow-md sm:p-8">
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary font-sans text-2xl font-bold text-white shadow-sm">
              {initials}
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-text sm:text-3xl">
                {displayName}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                <Mail className="h-4 w-4 text-text-muted" aria-hidden="true" />
                {user.email}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {user.role === "ADMIN" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                    System Administrator
                  </span>
                ) : user.role === "CONTENT_MANAGER" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600">
                    <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                    Content Manager
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    Learner
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-dark">
                  {plan === "PRO" && <Crown className="h-3.5 w-3.5 text-accent" aria-hidden="true" />}
                  {plan === "PRO" ? "Pro Plan" : "Free Plan"}
                </span>
              </div>
            </div>
          </div>

          <form action={logoutAction} className="shrink-0">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign Out
            </button>
          </form>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border/70 pt-6">
          <div className="rounded-2xl bg-neutral-bg/70 p-4 text-center">
            <Star className="mx-auto h-5 w-5 fill-amber-500 text-amber-500" aria-hidden="true" />
            <p className="mt-1 font-heading text-lg font-bold text-text">{xp} XP</p>
            <p className="text-xs text-text-muted">Total XP</p>
          </div>
          <div className="rounded-2xl bg-neutral-bg/70 p-4 text-center">
            <Flame className="mx-auto h-5 w-5 fill-orange-500 text-orange-500" aria-hidden="true" />
            <p className="mt-1 font-heading text-lg font-bold text-text">{streakCount} Days</p>
            <p className="text-xs text-text-muted">Current Streak</p>
          </div>
          <div className="rounded-2xl bg-neutral-bg/70 p-4 text-center">
            <Heart className="mx-auto h-5 w-5 fill-rose-500 text-rose-500" aria-hidden="true" />
            <p className="mt-1 font-heading text-lg font-bold text-text">{hearts}</p>
            <p className="text-xs text-text-muted">Available Hearts</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-border/80 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-text">Quick Access</h2>
          <p className="mt-1 text-xs text-text-secondary">
            Navigate to your learning tracks or management tools.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {isAdmin && (
              <Link
                href="/admin/arabic-entities"
                className="group flex items-center justify-between rounded-2xl border border-primary/20 bg-primary-light/40 p-4 transition-colors hover:bg-primary-light/70"
              >
                <div className="flex items-center gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                    <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-text group-hover:text-primary">
                      Admin Dashboard
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Manage dictionary, dialogues, and lessons
                    </p>
                  </div>
                </div>
                <span className="text-primary">&rarr;</span>
              </Link>
            )}

            <Link
              href="/courses"
              className="group flex items-center justify-between rounded-2xl border border-border/80 bg-neutral-bg/50 p-4 transition-colors hover:bg-neutral-bg"
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-text shadow-2xs">
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-text">
                    Spoken Arabic Courses
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Continue practical conversation lessons
                  </p>
                </div>
              </div>
              <span className="text-text-muted">&rarr;</span>
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-border/80 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-text">Account Information</h2>
          <p className="mt-1 text-xs text-text-secondary">
            Details linked to your Arabic Master profile.
          </p>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-neutral-bg/70 px-3.5 py-2.5">
              <dt className="flex items-center gap-2 text-text-secondary">
                <UserIcon className="h-4 w-4" aria-hidden="true" /> Name
              </dt>
              <dd className="font-semibold text-text">{displayName}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-neutral-bg/70 px-3.5 py-2.5">
              <dt className="flex items-center gap-2 text-text-secondary">
                <Mail className="h-4 w-4" aria-hidden="true" /> Email
              </dt>
              <dd className="font-medium text-text">{user.email}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-neutral-bg/70 px-3.5 py-2.5">
              <dt className="flex items-center gap-2 text-text-secondary">
                <Shield className="h-4 w-4" aria-hidden="true" /> Role
              </dt>
              <dd className="font-semibold text-primary">{user.role || "USER"}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-neutral-bg/70 px-3.5 py-2.5">
              <dt className="flex items-center gap-2 text-text-secondary">
                <Key className="h-4 w-4" aria-hidden="true" /> Account ID
              </dt>
              <dd className="font-mono text-xs text-text-muted">{user.id || "Active"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="h-64 w-full animate-pulse rounded-3xl bg-white" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
