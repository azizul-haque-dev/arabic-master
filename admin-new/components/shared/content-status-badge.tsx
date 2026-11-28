import { Circle, Clock, CheckCircle2, Rocket, XCircle, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CONTENT_STATUS_LABEL, type ContentStatus } from "@/lib/types/content";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<ContentStatus, { bg: string; text: string; icon: typeof Circle }> = {
  DRAFT: { bg: "border border-border bg-neutral-bg", text: "text-text-secondary", icon: Circle },
  IN_REVIEW: { bg: "border border-amber-300/50 bg-amber-50", text: "text-amber-800", icon: Clock },
  APPROVED: { bg: "border border-primary/20 bg-primary-light", text: "text-primary-dark", icon: CheckCircle2 },
  PUBLISHED: { bg: "border border-primary/20 bg-primary-light", text: "text-primary-dark", icon: Rocket },
  REJECTED: { bg: "border border-error/20 bg-error-bg", text: "text-error-text", icon: XCircle },
  ARCHIVED: { bg: "border border-border bg-neutral-bg", text: "text-text-muted", icon: Archive },
};

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  const { bg, text, icon: Icon } = STATUS_STYLE[status];
  return (
    <Badge className={cn(bg, text)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {CONTENT_STATUS_LABEL[status]}
    </Badge>
  );
}
