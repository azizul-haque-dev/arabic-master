import { Circle, Clock, CheckCircle2, Rocket, XCircle, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CONTENT_STATUS_LABEL, type ContentStatus } from "@/lib/types/content";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<ContentStatus, { bg: string; text: string; icon: typeof Circle }> = {
  DRAFT: { bg: "border border-white/10 bg-white/5", text: "text-white/75", icon: Circle },
  IN_REVIEW: { bg: "border border-amber-300/20 bg-amber-300/10", text: "text-amber-200", icon: Clock },
  APPROVED: { bg: "border border-sky-300/20 bg-sky-300/10", text: "text-sky-200", icon: CheckCircle2 },
  PUBLISHED: { bg: "bg-primary-light", text: "text-primary-dark", icon: Rocket },
  REJECTED: { bg: "border border-rose-300/20 bg-rose-300/10", text: "text-rose-200", icon: XCircle },
  ARCHIVED: { bg: "border border-white/10 bg-white/5", text: "text-white/60", icon: Archive },
};

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  const { bg, text, icon: Icon } = STATUS_STYLE[status];
  return (
    <Badge className={cn(bg, text)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {CONTENT_STATUS_LABEL[status]}
    </Badge>
  );
}
