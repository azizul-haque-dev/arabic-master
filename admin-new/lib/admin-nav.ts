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
  { label: "Courses", href: "/courses", icon: BookOpen, implemented: false },
  { label: "Sections", href: "/sections", icon: Layers, implemented: false },
  { label: "Lessons", href: "/lessons", icon: GraduationCap, implemented: false },
  { label: "Words", href: "/words", icon: Type, implemented: true },
  { label: "Sentences", href: "/sentences", icon: MessageSquareText, implemented: true },
  { label: "Conversations", href: "/conversations", icon: MessagesSquare, implemented: false },
  { label: "Arabic Entities", href: "/arabic-entities", icon: Sparkles, implemented: true },
];
