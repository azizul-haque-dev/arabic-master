import type { LucideIcon } from "lucide-react";

interface LearningPageHeaderProps {
  badge: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function LearningPageHeader({
  badge,
  title,
  description,
  icon: Icon,
}: LearningPageHeaderProps) {
  return (
    <div className="border-b border-border/80 bg-white">
      <div className="mx-auto max-w-container-max px-4 py-10 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-dark">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{badge}</span>
        </div>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-base text-text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}
