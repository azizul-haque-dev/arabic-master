"use client";

import { Moon, Sun } from "lucide-react";
import { useAppTheme } from "@/lib/theme-context";

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useAppTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={theme === "dark"}
      title={`Switch to ${nextTheme} mode`}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-colors hover:bg-neutral-bg hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
