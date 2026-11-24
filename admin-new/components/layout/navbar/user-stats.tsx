import { Crown, Flame, Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserStatsProps {
  xp: number;
  streakCount: number;
  hearts: number;
  plan?: "FREE" | "PRO";
  compact?: boolean;
  className?: string;
}

export function UserStats({
  xp,
  streakCount,
  hearts,
  plan = "FREE",
  compact = false,
  className,
}: UserStatsProps) {
  if (compact) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2.5 rounded-xl border border-border/80 bg-neutral-bg/80 px-2.5 py-1.5 text-xs font-semibold text-text",
          className,
        )}
        aria-label={`Learning stats: ${xp} XP, ${streakCount} day streak, ${hearts} hearts, ${plan} plan`}
      >
        <span className="inline-flex items-center gap-1 text-amber-600" title="Total XP">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
          <span>{xp} XP</span>
        </span>
        <span className="h-3 w-px bg-border" aria-hidden="true" />
        <span className="inline-flex items-center gap-1 text-orange-600" title="Day Streak">
          <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" aria-hidden="true" />
          <span>{streakCount}d</span>
        </span>
        <span className="h-3 w-px bg-border" aria-hidden="true" />
        <span className="inline-flex items-center gap-1 text-rose-600" title="Available Hearts">
          <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" aria-hidden="true" />
          <span>{hearts}</span>
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            plan === "PRO"
              ? "bg-amber-100 text-amber-800"
              : "bg-primary-light text-primary-dark",
          )}
        >
          {plan === "PRO" && <Crown className="h-2.5 w-2.5" aria-hidden="true" />}
          {plan}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-3 gap-2 text-center", className)}>
      <div className="rounded-xl border border-border/70 bg-neutral-bg/60 px-2 py-2">
        <div className="flex items-center justify-center gap-1 text-xs font-bold text-text">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
          <span>{xp} XP</span>
        </div>
        <span className="text-[10px] text-text-muted">Total XP</span>
      </div>
      <div className="rounded-xl border border-border/70 bg-neutral-bg/60 px-2 py-2">
        <div className="flex items-center justify-center gap-1 text-xs font-bold text-text">
          <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" aria-hidden="true" />
          <span>{streakCount} Day</span>
        </div>
        <span className="text-[10px] text-text-muted">Streak</span>
      </div>
      <div className="rounded-xl border border-border/70 bg-neutral-bg/60 px-2 py-2">
        <div className="flex items-center justify-center gap-1 text-xs font-bold text-text">
          <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" aria-hidden="true" />
          <span>{hearts}</span>
        </div>
        <span className="text-[10px] text-text-muted">Hearts</span>
      </div>
    </div>
  );
}
