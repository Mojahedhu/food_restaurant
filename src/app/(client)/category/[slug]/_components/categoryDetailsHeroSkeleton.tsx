import { Skeleton } from "@/components/ui/skeleton";

export function CategoryDetailsHeroSkeleton() {
  return (
    <div className="relative border-b bg-linear-to-br from-primary/5 via-background to-primary/5 overflow-hidden">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Image */}
          <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-2xl" />

          {/* Content */}
          <div className="flex-1 w-full">
            <Skeleton className="h-12 w-72 rounded mb-4" />

            <div className="space-y-3 mb-6">
              <Skeleton className="h-4 w-full max-w-xl rounded" />
              <Skeleton className="h-4 w-full max-w-lg rounded" />
              <Skeleton className="h-4 w-3/4 max-w-md rounded" />
            </div>

            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
