import { Skeleton } from "@/components/ui/skeleton";

function BlogHeroSkeleton() {
  return (
    <div className="relative w-full py-12 md:py-20 mb-12">
      <div className="mx-auto px-4 text-center max-w-4xl">
        {/* Category */}
        <div className="flex justify-center mb-6">
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>

        {/* Title */}
        <div className="space-y-3 mb-8">
          <Skeleton className="h-10 w-full max-w-3xl mx-auto" />
          <Skeleton className="h-10 w-3/4 max-w-2xl mx-auto" />
        </div>

        {/* Meta */}
        <div className="flex justify-center gap-6 mb-8">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-28" />
        </div>

        {/* Breadcrumb */}
        <div className="flex justify-start gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-2" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

export default BlogHeroSkeleton;
