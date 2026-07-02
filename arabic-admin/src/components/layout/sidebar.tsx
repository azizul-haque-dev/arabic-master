import { NavLink } from "react-router-dom";
import { LayoutGrid, BookText, MessageSquareText, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/words", label: "Words", icon: BookText },
  { to: "/sentences", label: "Sentences", icon: MessageSquareText },
  { to: "/categories", label: "Categories", icon: Tags },
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <span className="arabic-text text-xl text-accent">ع</span>
        <span className="text-sm font-semibold text-ink">Arabic App Admin</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-accent-soft text-accent" : "text-muted hover:bg-background hover:text-ink"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
