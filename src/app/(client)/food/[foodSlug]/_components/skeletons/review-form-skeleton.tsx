export const ReviewFormSkeleton = () => {
  return (
    <div className="mt-6 space-y-6 animate-pulse">
      <div className="h-10 bg-muted rounded-lg"></div>
      <div className="space-y-3">
        <div className="h-5 w-24 bg-muted rounded"></div>
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-9 h-9 bg-muted rounded-full"></div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-5 w-32 bg-muted rounded"></div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
      </div>
      <div className="h-11 bg-muted rounded-lg"></div>
    </div>
  );
};
