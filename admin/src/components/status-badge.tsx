import { Badge } from "@/components/ui/badge";
import type { Status } from "@/types";

const STATUS_STYLES: Record<
  Status,
  { label: string; variant: "default" | "outline" | "warning" | "destructive" }
> = {
  DRAFT: { label: "Draft", variant: "outline" },
  PUBLISHED: { label: "Published", variant: "default" },
  ACTIVE: { label: "Active", variant: "default" },
  DISABLED: { label: "Disabled", variant: "destructive" },
};

export function StatusBadge({ status }: { status: Status }) {
  const currentStyle = STATUS_STYLES[status] || {
    label: typeof status === "string" ? status : "Unknown",
    variant: "outline" as const,
  };

  const { label, variant } = currentStyle;

  return <Badge variant={variant}>{label}</Badge>;
}
