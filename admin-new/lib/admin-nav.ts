import type { LucideIcon } from "lucide-react";
import { BookOpen, Layers, GraduationCap, Type, MessageSquareText, MessagesSquare, Sparkles } from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Only "Arabic Entities" is implemented in this milestone. */
  implemented: boolean;
}

export const CONTENT_NAV: AdminNavItem[] = [
  { label: "Courses", href: "/admin/courses", icon: BookOpen, implemented: true },
  { label: "Sections", href: "/admin/sections", icon: Layers, implemented: true },
  { label: "Lessons", href: "/admin/lessons", icon: GraduationCap, implemented: true },
  { label: "Words", href: "/admin/words", icon: Type, implemented: true },
  { label: "Sentences", href: "/admin/sentences", icon: MessageSquareText, implemented: true },
  { label: "Conversations", href: "/admin/conversations", icon: MessagesSquare, implemented: true },
  { label: "Arabic Entities", href: "/admin/arabic-entities", icon: Sparkles, implemented: true },
];