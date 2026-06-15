import { MapPin } from "lucide-react";
import React from "react";

function ContactMapSkeleton() {
  return (
    <section className="container mx-auto px-4 pb-16">
      {/* <Skeleton className="h-[320px] w-full rounded-xl" /> */}
      <div className="relative h-[320px] w-full rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse z-10">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <MapPin className="h-8 w-8 animate-bounce text-primary" />
            <span className="text-sm font-medium">Loading Map...</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactMapSkeleton;
