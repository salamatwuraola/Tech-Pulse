export function ArticleSkeleton() {
  return (
    <div className="bg-card border border-card-border rounded-lg overflow-hidden flex flex-col">
      {/* Image skeleton */}
      <div className="h-48 skeleton-shimmer flex-shrink-0" />

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Source + time row */}
        <div className="flex items-center justify-between">
          <div className="skeleton-shimmer h-3 w-24 rounded-full" />
          <div className="skeleton-shimmer h-3 w-16 rounded-full" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="skeleton-shimmer h-4 w-full rounded-full" />
          <div className="skeleton-shimmer h-4 w-5/6 rounded-full" />
          <div className="skeleton-shimmer h-4 w-3/4 rounded-full" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="skeleton-shimmer h-3 w-full rounded-full" />
          <div className="skeleton-shimmer h-3 w-4/5 rounded-full" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-card-border mt-auto">
          <div className="skeleton-shimmer h-3 w-24 rounded-full" />
          <div className="skeleton-shimmer h-7 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}
