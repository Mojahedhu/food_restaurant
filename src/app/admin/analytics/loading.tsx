import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
export default function AdminAnalyticsLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      {/* KPI Cards Skeletons */}
      <KpiCardsSkeleton />
      {/* Main Charts Skeletons */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Sales Chart Skeleton */}
        <SalesChartSkeleton />
        {/* Category Share Donut Skeleton */}
        <CategoryDistributionSkeleton />
      </div>
      {/* Lower Bento Skeletons */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Top Selling Products */}
        <TopSellingProductsSkeleton />
        {/* Hourly Peak Load */}
        <HourlyPeakSkeleton />
      </div>
    </div>
  );
}

function KpiCardsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <Card key={idx} className="border border-border/80 shadow-xs">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-10 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SalesChartSkeleton() {
  return (
    <Card className="col-span-1 lg:col-span-5 border border-border/80 shadow-xs h-[450px]">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="h-[330px] flex items-end justify-between px-6 pb-6">
        <div className="w-full h-full flex flex-col justify-between pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-[1px] flex-1 bg-border/40" />
            </div>
          ))}
          <div className="flex justify-between pl-12 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-10" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryDistributionSkeleton() {
  return (
    <Card className="col-span-1 lg:col-span-2 border border-border/80 shadow-xs h-[450px]">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="h-[250px] flex items-center justify-center">
        <Skeleton className="size-40 rounded-full border-15 border-slate-100 dark:border-slate-800" />
      </CardContent>
      <div className="px-6 pb-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function TopSellingProductsSkeleton() {
  return (
    <Card className="border border-border/80 shadow-xs h-[420px]">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function HourlyPeakSkeleton() {
  {
    /* Hourly Peak Load */
  }
  return (
    <Card className="border border-border/80 shadow-xs h-[420px]">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="h-[290px] flex items-end justify-between px-6 pb-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-4 rounded-t-xs"
            style={{
              height: `${[30, 45, 60, 80, 50, 40, 75, 90, 65, 55, 40, 30][i]}%`,
            }}
          />
        ))}
      </CardContent>
    </Card>
  );
}
