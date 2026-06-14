import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

function AboutValueSkeleton() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <Skeleton className="h-10 w-56 mx-auto mb-12" />

        <div className="space-y-10">
          {Array.from({ length: 3 }).map((_, index) => (
            <ValueSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutValueSkeleton;

export function ValueSkeleton() {
  return (
    <div>
      <Skeleton className="h-7 w-48 mb-3" />

      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-5 w-10/12" />
    </div>
  );
}
