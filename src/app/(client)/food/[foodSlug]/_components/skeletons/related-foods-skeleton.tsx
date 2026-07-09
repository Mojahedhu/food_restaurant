export function RelatedFoodSkeleton() {
  return (
    <div>
      <div className="h-8 w-48 bg-muted-foreground/20 rounded animate-pulse mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square bg-muted-foreground/10 rounded-xl animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-5 w-3/4 bg-muted-foreground/20 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-muted-foreground/10 rounded animate-pulse"></div>
              <div className="h-6 w-24 bg-muted-foreground/20 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
