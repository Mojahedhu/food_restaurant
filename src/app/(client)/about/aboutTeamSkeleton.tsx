import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

function AboutTeamSkeleton() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <Skeleton className="h-10 w-72 mx-auto mb-4" />
        <Skeleton className="h-5 w-80 max-w-full mx-auto" />
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <TeamCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

export default AboutTeamSkeleton;

export function TeamCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Skeleton className="h-64 w-full" />

      <div className="p-6 text-center">
        <Skeleton className="h-7 w-40 mx-auto mb-3" />

        <Skeleton className="h-6 w-24 mx-auto rounded-full mb-4" />

        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
      </div>
    </div>
  );
}
