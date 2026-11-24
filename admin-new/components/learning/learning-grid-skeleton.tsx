export function LearningGridSkeleton() {
  return (
    <div
      className="mx-auto grid max-w-container-max grid-cols-1 gap-5 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8"
      aria-hidden="true"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-44 animate-pulse rounded-2xl border border-border/70 bg-white"
        />
      ))}
    </div>
  );
}
