import { Flame, Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserStatsProps {
  xp: number;
  streakCount: number;
  hearts: number;
  className?: string;
}

export function UserStats({
  xp,
  streakCount,
  hearts,
  className,
}: UserStatsProps) {
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
