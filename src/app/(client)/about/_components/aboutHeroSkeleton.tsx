import { Skeleton } from "@/components/ui/skeleton";

function AboutHeroSkeleton() {
  return (
    <>
      <section className="border-b bg-linear-to-br from-primary/5 via-secondary/30 to-accent/20">
        <div className="container mx-auto px-4 py-16 text-center">
          <Skeleton className="h-7 w-24 mx-auto rounded-full mb-4" />

          <Skeleton className="h-12 w-72 mx-auto mb-4" />

          <Skeleton className="h-5 w-full max-w-xl mx-auto mb-2" />
          <Skeleton className="h-5 w-3/4 max-w-lg mx-auto" />
        </div>
      </section>
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <Skeleton className="h-10 w-56 mx-auto mb-6" />

          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12 mx-auto" />

            <div className="pt-2" />

            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-9/12 mx-auto" />
          </div>
        </div>
      </section>
      <section className="border-y bg-secondary/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="h-12 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-28 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutHeroSkeleton;
