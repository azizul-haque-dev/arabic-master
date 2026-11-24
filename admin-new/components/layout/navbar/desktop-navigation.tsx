"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  Home,
  MessageSquareText,
  MessagesSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Words", href: "/words", icon: BookOpen },
  { label: "Sentences", href: "/sentences", icon: MessageSquareText },
  { label: "Conversations", href: "/conversations", icon: MessagesSquare },
] as const;

const COURSE_LINKS = [
  { label: "All Courses", description: "Structured Beginner to Advanced tracks", href: "/courses" },
  { label: "Free Courses", description: "Essential everyday spoken Arabic", href: "/courses?type=FREE" },
  { label: "Pro Curriculum", description: "Full guided lessons & tenses", href: "/pricing" },
] as const;

export function DesktopNavigation() {
  const pathname = usePathname();
  const [coursesOpen, setCoursesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCoursesOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setCoursesOpen(false);
    }
    if (coursesOpen) {
      document.addEventListener("mousedown", onOutside);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [coursesOpen]);

  const isCoursesActive = pathname === "/courses" || pathname.startsWith("/courses/");

  return (
    <nav aria-label="Primary navigation" className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-[#19172f] p-1 lg:flex">
      {NAV_ITEMS.map(({ label, href }) => {
        const isActive = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive
                ? "bg-primary text-white shadow-sm shadow-primary/25"
                : "text-white/75 hover:bg-[#302d48] hover:text-white hover:ring-1 hover:ring-inset hover:ring-primary-light/15",
            )}
          >
            <span>{label}</span>
          </Link>
        );
      })}

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          aria-expanded={coursesOpen}
          aria-haspopup="menu"
          onClick={() => setCoursesOpen((prev) => !prev)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            isCoursesActive
              ? "bg-primary text-white shadow-sm shadow-primary/25"
              : "text-white/75 hover:bg-[#302d48] hover:text-white hover:ring-1 hover:ring-inset hover:ring-primary-light/15",
          )}
        >
          <span>Courses</span>
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform duration-150", coursesOpen && "rotate-180")}
            aria-hidden="true"
          />
        </button>

        {coursesOpen && (
          <div
            role="menu"
            className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-white/10 bg-[#211f37] p-1.5 shadow-xl shadow-black/30"
          >
            {COURSE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setCoursesOpen(false)}
                className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-[#302d48]"
              >
                <span className="block text-sm font-semibold text-text">{item.label}</span>
                <span className="block text-xs text-text-muted">{item.description}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
