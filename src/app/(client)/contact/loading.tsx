import { BreadcrumbSkeleton } from "../restaurants/_components/breadcrumbSkeleton";
import ContactHeroSkeleton from "./_components/contactHeroSkeleton";
import ContactBodySkeleton from "./_components/contactBodySkeleton";
import ContactMapSkeleton from "./_components/contactMapSkeleton";

function ContactPageLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}

      <BreadcrumbSkeleton />

      {/* Hero */}
      {/* <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="mx-auto mb-4 h-5 w-28 rounded-full" />
          <Skeleton className="mx-auto mb-5 h-10 w-full max-w-xl sm:h-14" />
          <Skeleton className="mx-auto h-5 w-full max-w-2xl" />
          <Skeleton className="mx-auto mt-3 h-5 w-full max-w-lg" />
        </div>
      </section> */}
      <ContactHeroSkeleton />

      {/* Contact Body */}
      {/* <section className="container mx-auto grid grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <Skeleton className="mb-4 h-10 w-10 rounded-full" />
              <Skeleton className="mb-2 h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
          <Skeleton className="mb-6 h-7 w-40" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-11 w-full rounded-md" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
          <Skeleton className="mt-4 h-11 w-full rounded-md" />
          <Skeleton className="mt-4 h-32 w-full rounded-md" />
          <Skeleton className="mt-6 h-11 w-36 rounded-md" />
        </div>
      </section> */}
      <ContactBodySkeleton />
      {/* Map */}
      <ContactMapSkeleton />
    </div>
  );
}

export default ContactPageLoading;
