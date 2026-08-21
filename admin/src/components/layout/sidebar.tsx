import { cn } from "@/lib/utils";
import {
  BookText,
  FileHeadphone,
  Languages,
  LayoutGrid,
  MessageSquareText,
  MessagesSquare,
  Tags,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/arabic-texts", label: "Arabic Texts", icon: Languages },
  { to: "/words", label: "Words", icon: BookText },
  { to: "/sentences", label: "Sentences", icon: MessageSquareText },
  { to: "/topics", label: "Conversations", icon: MessagesSquare },
  { to: "/media", label: "Media", icon: FileHeadphone },
  { to: "/categories", label: "Categories", icon: Tags },
];

export function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent-soft text-accent"
                : "text-muted hover:bg-background hover:text-ink",
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <span className="arabic-text text-xl text-accent">ع</span>
        <span className="text-sm font-semibold text-ink">Arabic App Admin</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        <NavigationLinks />
      </nav>
    </aside>
  );
}
