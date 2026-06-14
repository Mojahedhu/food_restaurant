import { Skeleton } from "@/components/ui/skeleton";

function AboutWhySkeleton() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <Skeleton className="h-10 w-72 mx-auto mb-4" />
        <Skeleton className="h-5 w-96 max-w-full mx-auto" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <FeatureCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

export default AboutWhySkeleton;

export function FeatureCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <Skeleton className="h-12 w-12 rounded-lg mb-4" />

      <Skeleton className="h-6 w-40 mb-3" />

      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}
