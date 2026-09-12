import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-border bg-white px-6 py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-bg">
        <Icon className="h-5 w-5 text-text-muted" aria-hidden="true" />
      </div>
      <h3 className="font-heading text-base font-semibold text-text">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
