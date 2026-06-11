import { Skeleton } from "@/components/ui/skeleton";
import AuthorCardSkeleton from "./authorCardSkeleton";

function BlogPostBodySkeleton() {
  return (
    <article className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-gray-100">
      {/* Featured image */}
      <Skeleton className="w-full aspect-video rounded-xl mb-10" />

      {/* Content */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />

        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-5 w-10/12" />

        <Skeleton className="h-7 w-1/2 mt-8" />

        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-9/12" />

        <Skeleton className="h-7 w-1/3 mt-8" />

        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}

        {/* Two-up image section */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <Skeleton className="aspect-4/3 rounded-xl" />
          <Skeleton className="aspect-4/3 rounded-xl" />
        </div>

        <Skeleton className="h-7 w-1/2 mt-8" />

        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={`paragraph-${i}`} className="h-5 w-full" />
        ))}
      </div>
      <AuthorCardSkeleton />
    </article>
  );
}

export default BlogPostBodySkeleton;
