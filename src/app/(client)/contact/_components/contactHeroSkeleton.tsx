import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

function ContactHeroSkeleton() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4 text-center">
        <Skeleton className="mx-auto mb-4 h-5 w-28 rounded-full" />
        <Skeleton className="mx-auto mb-5 h-10 w-full max-w-xl sm:h-14" />
        <Skeleton className="mx-auto h-5 w-full max-w-2xl" />
        <Skeleton className="mx-auto mt-3 h-5 w-full max-w-lg" />
      </div>
    </section>
  );
}

export default ContactHeroSkeleton;
