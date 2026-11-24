import Link from "next/link";

export function GuestNavigation() {
  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Link
        href="/login"
        className="inline-flex h-10 items-center justify-center rounded-xl px-3.5 text-sm font-medium text-white/75 transition-colors hover:bg-[#302d48] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#554ce8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Sign Up Free
      </Link>
    </div>
  );
}
