export function ReviewSkeleton() {
  return (
    <div>
      <div className="h-8 w-48 bg-muted-foreground/20 rounded animate-pulse mb-6"></div>
      <div className="bg-muted/50 rounded-xl p-6 mb-8 space-y-4">
        <div className="h-6 w-40 bg-muted-foreground/20 rounded animate-pulse"></div>
        <div className="h-32 w-full bg-muted-foreground/10 rounded-lg animate-pulse"></div>
        <div className="h-10 w-32 bg-muted-foreground/20 rounded-full animate-pulse"></div>
      </div>
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted/30 rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-muted-foreground/20 rounded-full animate-pulse shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-32 bg-muted-foreground/20 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-muted-foreground/20 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted-foreground/10 rounded animate-pulse"></div>
              <div className="h-4 w-5/6 bg-muted-foreground/10 rounded animate-pulse"></div>
              <div className="h-4 w-4/6 bg-muted-foreground/10 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
