import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  GraduationCap,
  Layers,
  MessageSquareText,
  MessagesSquare,
  Sparkles,
  Type,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Only "Arabic Entities" is implemented in this milestone. */
  implemented: boolean;
}

export const CONTENT_NAV: AdminNavItem[] = [
  { label: "Courses", href: "/admin/courses", icon: BookOpen, implemented: false },
  { label: "Sections", href: "/admin/sections", icon: Layers, implemented: false },
  {
    label: "Lessons",
    href: "/admin/lessons",
    icon: GraduationCap,
    implemented: false,
  },
  { label: "Words", href: "/admin/words", icon: Type, implemented: true },
  {
    label: "Sentences",
    href: "/admin/sentences",
    icon: MessageSquareText,
    implemented: true,
  },
  {
    label: "Conversations",
    href: "/admin/conversations",
    icon: MessagesSquare,
    implemented: true,
  },
  {
    label: "Arabic Entities",
    href: "/admin/arabic-entities",
    icon: Sparkles,
    implemented: true,
  },
];
