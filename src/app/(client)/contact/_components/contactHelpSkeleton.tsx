import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

function ContactHelpSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <Skeleton className="mb-6 h-5 w-32" />
      <Skeleton className="mb-2 h-5 w-10" />
      <Skeleton className="mb-2 h-5 w-32" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-2 h-4 w-32" />
    </div>
  );
}

export default ContactHelpSkeleton;
