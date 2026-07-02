import { Badge } from "@/components/ui/badge";
import type { Status } from "@/types";

const STATUS_STYLES: Record<Status, { label: string; variant: "default" | "outline" | "warning" | "destructive" }> = {
  DRAFT: { label: "Draft", variant: "outline" },
  PUBLISHED: { label: "Published", variant: "default" },
  ACTIVE: { label: "Active", variant: "default" },
  DISABLED: { label: "Disabled", variant: "destructive" },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, variant } = STATUS_STYLES[status];
  return <Badge variant={variant}>{label}</Badge>;
}
