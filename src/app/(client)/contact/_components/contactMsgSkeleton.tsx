import { Skeleton } from "@/components/ui/skeleton";

function ContactMsgSkeleton() {
  return (
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
  );
}

export default ContactMsgSkeleton;
