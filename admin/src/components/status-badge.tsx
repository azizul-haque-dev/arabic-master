import { Badge } from "@/components/ui/badge";
import type { AiGenerationStatus, Status } from "@/types";

const STATUS_STYLES: Record<
  Status | AiGenerationStatus,
  { label: string; variant: "default" | "outline" | "warning" | "destructive" }
> = {
  DRAFT: { label: "Draft", variant: "outline" },
  PUBLISHED: { label: "Published", variant: "default" },
  ACTIVE: { label: "Active", variant: "default" },
  DISABLED: { label: "Disabled", variant: "destructive" },
  PENDING: { label: "Pending", variant: "warning" },
  PROCESSING: { label: "Processing", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "default" },
  FAILED: { label: "Failed", variant: "destructive" },
};

export function StatusBadge({ status }: { status: Status | AiGenerationStatus }) {
  const currentStyle = STATUS_STYLES[status] || {
    label: typeof status === "string" ? status : "Unknown",
    variant: "outline" as const,
  };

  const { label, variant } = currentStyle;

  return <Badge variant={variant}>{label}</Badge>;
}

