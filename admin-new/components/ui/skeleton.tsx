import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-default border border-white/5 bg-[#302d48]",
        className,
      )}
    />
  );
}
