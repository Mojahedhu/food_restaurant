import { Skeleton } from "@/components/ui/skeleton";

export function CategoryDetailsHeroSkeleton() {
  return (
    <div className="relative border-b bg-linear-to-br from-primary/5 via-background to-primary/5 overflow-hidden animate-in fade-in duration-500">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Image */}
          <Skeleton className="shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-muted/50" />

          {/* Content */}
          <div className="flex-1 w-full flex flex-col items-center md:items-start">
            <Skeleton className="h-12 w-72 rounded-lg mb-4 bg-muted/50" />

            <div className="space-y-3 mb-6 w-full max-w-xl flex flex-col items-center md:items-start">
              <Skeleton className="h-4 w-full rounded bg-muted/40" />
              <Skeleton className="h-4 w-[90%] rounded bg-muted/40" />
              <Skeleton className="h-4 w-[75%] rounded bg-muted/40" />
            </div>

            <Skeleton className="h-10 w-40 rounded-full bg-muted/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
