import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

function ContactInfoSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />

        <div className="w-full space-y-2">
          <Skeleton className="h-4 mb-2 w-32" />
          <Skeleton className="h-4 w-42" />
          <Skeleton className="h-4 w-42" />
        </div>
      </div>
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />

          <div className="w-full space-y-2">
            <Skeleton className="h-4 mb-2 w-32" />
            <Skeleton className="h-4 w-42" />
          </div>
        </div>
      ))}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />

        <div className="w-full space-y-2">
          <Skeleton className="h-4 mb-2 w-32" />
          <Skeleton className="h-4 w-42" />
          <Skeleton className="h-4 w-42" />
        </div>
      </div>
    </div>
  );
}

export default ContactInfoSkeleton;
