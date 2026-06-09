export function FoodDetailsSkeleton() {
  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      <div className="space-y-4">
        <div className="aspect-square rounded-2xl bg-muted-foreground/10 animate-pulse"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-muted-foreground/10 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-24 bg-muted-foreground/20 rounded-full animate-pulse"></div>
          <div className="h-5 w-32 bg-muted-foreground/20 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <div className="h-10 w-3/4 bg-muted-foreground/20 rounded animate-pulse"></div>
          <div className="h-6 w-full bg-muted-foreground/20 rounded animate-pulse"></div>
          <div className="h-6 w-5/6 bg-muted-foreground/20 rounded animate-pulse"></div>
        </div>
        <div className="flex items-baseline gap-3">
          <div className="h-12 w-32 bg-muted-foreground/20 rounded animate-pulse"></div>
          <div className="h-6 w-24 bg-muted-foreground/20 rounded animate-pulse"></div>
          <div className="h-6 w-20 bg-muted-foreground/20 rounded-full animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="text-center p-3 rounded-lg bg-muted space-y-2">
            <div className="w-5 h-5 mx-auto bg-muted-foreground/20 rounded animate-pulse"></div>
            <div className="h-3 w-16 mx-auto bg-muted-foreground/20 rounded animate-pulse"></div>
            <div className="h-5 w-20 mx-auto bg-muted-foreground/20 rounded animate-pulse"></div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted space-y-2">
            <div className="w-5 h-5 mx-auto bg-muted-foreground/20 rounded animate-pulse"></div>
            <div className="h-3 w-16 mx-auto bg-muted-foreground/20 rounded animate-pulse"></div>
            <div className="h-5 w-20 mx-auto bg-muted-foreground/20 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-5 w-32 bg-muted-foreground/20 rounded animate-pulse"></div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-24 bg-muted-foreground/10 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-5 w-24 bg-muted-foreground/20 rounded animate-pulse"></div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-7 w-20 bg-muted-foreground/10 rounded-full animate-pulse"
              ></div>
            ))}
          </div>
        </div>
        <div className="pt-4">
          <div className="h-14 w-full bg-muted-foreground/20 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="mt-12 lg:mt-16 mb-12">
        <div>
          <div className="h-8 w-32 bg-muted-foreground/20 rounded animate-pulse mb-6"></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
              <div className="w-5 h-5 bg-muted-foreground/20 rounded shrink-0 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-24 bg-muted-foreground/20 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-muted-foreground/20 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
              <div className="w-5 h-5 bg-muted-foreground/20 rounded shrink-0 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-24 bg-muted-foreground/20 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-muted-foreground/20 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
              <div className="w-5 h-5 bg-muted-foreground/20 rounded shrink-0 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-24 bg-muted-foreground/20 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-muted-foreground/20 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
              <div className="w-5 h-5 bg-muted-foreground/20 rounded shrink-0 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-24 bg-muted-foreground/20 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-muted-foreground/20 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
              <div className="w-5 h-5 bg-muted-foreground/20 rounded shrink-0 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-24 bg-muted-foreground/20 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-muted-foreground/20 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
              <div className="w-5 h-5 bg-muted-foreground/20 rounded shrink-0 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-24 bg-muted-foreground/20 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-muted-foreground/20 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FoodReviewSkeleton() {
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
