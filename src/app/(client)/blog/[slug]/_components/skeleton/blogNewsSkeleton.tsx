import { Skeleton } from "@/components/ui/skeleton";

function BlogNewsletterSkeleton() {
  return (
    <div className="bg-white shadow-sm p-8 rounded-xl border border-primary/10">
      <Skeleton className="h-7 w-48 mx-auto mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mx-auto mb-5" />

      <Skeleton className="h-10 w-full mb-3" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default BlogNewsletterSkeleton;
