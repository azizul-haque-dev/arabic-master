import { getAuthSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, LogOut, Shield, User as UserIcon, BookOpen, CheckCircle, Mail, Key } from "lucide-react";
import { logoutAction } from "@/actions/auth/logout-action";

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

export default async function ProfilePage() {
  const { user } = await getAuthSession();

  if (!user) {
    redirect("/login");
  }

  const rawName = typeof user.fullName === "string" ? user.fullName : typeof user.name === "string" ? user.name : undefined;
  const rawEmail = typeof user.email === "string" ? user.email : undefined;
  const displayName: string = rawName || (rawEmail ? rawEmail.split("@")[0] : "User");
  const initials = getInitials(rawName, rawEmail);
  const isAdmin = user.role === "ADMIN" || user.role === "CONTENT_MANAGER";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/90 p-6 shadow-xl backdrop-blur-xl sm:p-8">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-primary-dark font-sans text-2xl font-bold text-white shadow-lg ring-4 ring-primary/20">
              {initials}
            </div>
            <div>
              <h1 className="font-headline-md text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
                {displayName}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-on-surface-variant">
                <Mail className="h-4 w-4 text-on-surface-variant/80" />
                {user.email}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {user.role === "ADMIN" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <Shield className="h-3.5 w-3.5" />
                    System Administrator
                  </span>
                ) : user.role === "CONTENT_MANAGER" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600">
                    <Shield className="h-3.5 w-3.5" />
                    Content Manager
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Student / Learner
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface-variant">
                  Active
                </span>
              </div>
            </div>
          </div>

          <form action={logoutAction} className="shrink-0">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/70 px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition-all hover:bg-red-100/80 active:translate-y-px"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Quick Access Actions */}
        <div className="rounded-3xl border border-border/80 bg-surface/90 p-6 shadow-lg backdrop-blur-xl">
          <h2 className="text-lg font-bold text-on-surface">Quick Access</h2>
          <p className="mt-1 text-xs text-on-surface-variant">
            Navigate to your learning dashboard or management tools.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {isAdmin && (
              <Link
                href="/admin/arabic-entities"
                className="group flex items-center justify-between rounded-2xl border border-primary/20 bg-primary-light/20 p-4 transition-all hover:bg-primary-light/35 hover:shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
                    <LayoutDashboard className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface group-hover:text-primary">
                      Admin Dashboard
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Manage dictionary, dialogues, and lessons
                    </p>
                  </div>
                </div>
                <span className="text-primary transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>
            )}

            <Link
              href="/"
              className="group flex items-center justify-between rounded-2xl border border-border/80 bg-surface-container-low p-4 transition-all hover:bg-surface-container hover:shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface shadow-sm">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">
                    Spoken Arabic Lessons
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Return to practical conversation courses
                  </p>
                </div>
              </div>
              <span className="text-on-surface-variant transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        {/* Account Details */}
        <div className="rounded-3xl border border-border/80 bg-surface/90 p-6 shadow-lg backdrop-blur-xl">
          <h2 className="text-lg font-bold text-on-surface">Account Information</h2>
          <p className="mt-1 text-xs text-on-surface-variant">
            Details linked to your Arabic Master profile.
          </p>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-surface-container-low/70 px-3.5 py-2.5">
              <dt className="flex items-center gap-2 text-on-surface-variant">
                <UserIcon className="h-4 w-4" /> Name
              </dt>
              <dd className="font-semibold text-on-surface">{displayName}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-container-low/70 px-3.5 py-2.5">
              <dt className="flex items-center gap-2 text-on-surface-variant">
                <Mail className="h-4 w-4" /> Email
              </dt>
              <dd className="font-medium text-on-surface">{user.email}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-container-low/70 px-3.5 py-2.5">
              <dt className="flex items-center gap-2 text-on-surface-variant">
                <Shield className="h-4 w-4" /> Role
              </dt>
              <dd className="font-semibold text-primary">{user.role || "USER"}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-container-low/70 px-3.5 py-2.5">
              <dt className="flex items-center gap-2 text-on-surface-variant">
                <Key className="h-4 w-4" /> Account ID
              </dt>
              <dd className="font-mono text-xs text-on-surface-variant">{user.id || "Active"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
