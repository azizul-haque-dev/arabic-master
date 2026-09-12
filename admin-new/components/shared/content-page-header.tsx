export function ContentPageHeader({
  title,
  description,
  primaryAction,
  secondaryAction,
}: {
  title: string;
  description?: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-[-0.015em] text-text">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-xl text-sm text-text-secondary">{description}</p>
        ) : null}
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-shrink-0 items-center gap-2">
          {secondaryAction}
          {primaryAction}
        </div>
      )}
    </div>
  );
}
