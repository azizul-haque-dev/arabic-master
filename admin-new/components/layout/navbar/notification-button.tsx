"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import type { LearnerNotification } from "@/lib/types/learner";

interface NotificationButtonProps {
  unreadCount?: number;
  notifications?: LearnerNotification[];
}

export function NotificationButton({
  unreadCount = 0,
  notifications = [],
}: NotificationButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("keydown", handleKey);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={
          unreadCount > 0
            ? `Notifications (${unreadCount} unread)`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-text-secondary transition-colors hover:border-primary-light/40 hover:bg-neutral-bg hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-border bg-surface p-3 shadow-lg"
        >
          <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
            <span className="text-sm font-semibold text-text">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary-light px-2 py-0.5 text-[11px] font-semibold text-primary-dark">
                {unreadCount} new
              </span>
            )}
          </div>

          {notifications.length > 0 ? (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {notifications.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-border bg-neutral-bg p-2.5 text-xs"
                >
                  <p className="font-semibold text-text">{item.title}</p>
                  <p className="mt-0.5 text-text-secondary">{item.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-xs text-text-muted">
              You&apos;re all caught up. Complete a daily lesson to build your streak!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
