import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesSkeleton() {
  return (
    <div className="animate-in fade-in duration-500 w-full">
      {/* Hero Skeleton */}
      <div className="relative border-b bg-muted/10 overflow-hidden">
        <div className="container mx-auto px-4 py-20 text-center flex flex-col items-center">
          <Skeleton className="h-8 w-40 rounded-full mb-6 bg-muted/40" />
          <Skeleton className="h-16 w-3/4 max-w-2xl rounded-lg mb-6 bg-muted/40" />
          <Skeleton className="h-6 w-1/2 max-w-lg rounded-lg mb-8 bg-muted/40" />
          <Skeleton className="h-5 w-48 rounded-full bg-muted/40" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-[320px] rounded-2xl bg-card border border-border/50 shadow-sm p-8 flex flex-col items-center"
            >
              <Skeleton className="h-32 w-32 rounded-2xl mb-6 bg-muted/50" />
              <Skeleton className="h-6 w-2/3 rounded-md mb-6 bg-muted/50" />
              <div className="mt-auto w-full flex justify-center">
                <Skeleton className="h-8 w-28 rounded-full bg-muted/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
