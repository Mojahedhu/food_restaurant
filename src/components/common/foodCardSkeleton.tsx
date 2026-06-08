const FoodCardSkeleton = () => {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-48 w-full bg-muted" />
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category badge skeleton */}
        <div className="h-5 w-20 bg-muted rounded-full" />

        {/* Title skeleton*/}
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-muted rounded" />
          <div className="h-5 w-1/4 bg-muted rounded" />
        </div>

        {/* Description Skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
};

export default FoodCardSkeleton;
