import { Circle, Clock, CheckCircle2, Rocket, XCircle, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CONTENT_STATUS_LABEL, type ContentStatus } from "@/lib/types/content";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<ContentStatus, { bg: string; text: string; icon: typeof Circle }> = {
  DRAFT: { bg: "bg-neutral-bg", text: "text-neutral-text", icon: Circle },
  IN_REVIEW: { bg: "bg-warning-bg", text: "text-warning-text", icon: Clock },
  APPROVED: { bg: "bg-info-bg", text: "text-info-text", icon: CheckCircle2 },
  PUBLISHED: { bg: "bg-success-bg", text: "text-success-text", icon: Rocket },
  REJECTED: { bg: "bg-error-bg", text: "text-error-text", icon: XCircle },
  ARCHIVED: { bg: "bg-neutral-bg", text: "text-text-muted", icon: Archive },
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
