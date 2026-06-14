import { Skeleton } from "@/components/ui/skeleton";

export const Fallback = () => {
  return (
    <div className="min-w-[500px]  max-w-md mx-auto  h-[600px] rounded-xl border p-4 animate-pulse flex flex-col gap-4 justify-center items-center">
      <Skeleton className="w-40 h-10 rounded-full" />
      <Skeleton className="w-full h-10" />
      <Skeleton className="w-full h-10" />
      <Skeleton className="w-full h-10" />
      <Skeleton className="w-full h-10" />
    </div>
  );
};
