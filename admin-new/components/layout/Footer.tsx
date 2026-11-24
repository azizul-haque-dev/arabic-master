import Link from "next/link";
import { CopyrightYear } from "@/components/shared/copyright-year";

const footerSections = [
  {
    title: "Learning Modules",
    links: [
      { label: "Arabic Words", href: "/words" },
      { label: "Daily Sentences", href: "/sentences" },
      { label: "Conversations", href: "/conversations" },
      { label: "Structured Courses", href: "/courses" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Why Arabic Master", href: "/#why-arabic-master" },
      { label: "Arabic Master Pro", href: "/pricing" },
      { label: "Create Free Account", href: "/register" },
      { label: "Sign In", href: "/login" },
    ],
  },
  {
    title: "Learners",
    links: [
      { label: "Bangla & English Support", href: "/words" },
      { label: "Saudi & Gulf Spoken Arabic", href: "/sentences" },
      { label: "My Profile", href: "/profile" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-16 w-full border-t border-border/80 bg-white">
      <div className="mx-auto max-w-container-max px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary"
                aria-hidden="true"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 6.2C10.1 4.9 7.6 4.4 5.1 4.7C4.2 4.8 3.5 5.5 3.5 6.4V17.2C3.5 18.2 4.4 18.9 5.4 18.8C7.7 18.5 10.1 19 12 20.3C13.9 19 16.3 18.5 18.6 18.8C19.6 18.9 20.5 18.2 20.5 17.2V6.4C20.5 5.5 19.8 4.8 18.9 4.7C16.4 4.4 13.9 4.9 12 6.2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M12 6.2V20.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <span>
                <span className="block font-heading text-base font-bold text-text">
                  Arabic Master
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                  SPOKEN ARABIC
                </span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-text-secondary">
              Practical spoken Arabic for everyday life in Saudi Arabia and
              Arabic-speaking countries—built for Bangla and English speakers.
            </p>
          </div>

          {footerSections.map((column) => (
            <div key={column.title}>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-text">
                {column.title}
              </h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/70 pt-6 text-xs text-text-muted sm:flex-row">
          <p>© <CopyrightYear /> Arabic Master. All rights reserved.</p>
          <p>Learn the Arabic You Actually Need to Speak.</p>
        </div>
      </div>
    </footer>
  );
}
