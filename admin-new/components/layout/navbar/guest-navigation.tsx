import Link from "next/link";

export function GuestNavigation() {
  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Link
        href="/login"
        className="inline-flex h-10 items-center justify-center rounded-lg px-3.5 text-sm font-medium text-text-secondary transition-colors hover:bg-neutral-bg hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Sign up free
      </Link>
    </div>
  );
}
