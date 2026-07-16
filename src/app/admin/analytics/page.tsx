import { fetchAdminAnalyticsData } from "@/actions/admin-analytics";

import { AnalyticsMetricCards } from "@/components/admin/features/analytics/analyticsMetricCards";
import { InteractiveSalesChart } from "@/components/admin/features/analytics/interactiveSalesChart";
import { CategoryDistribution } from "@/components/admin/features/analytics/categoryDistribution";
import { TopSellingProducts } from "@/components/admin/features/analytics/topSellingProducts";
import { HourlyPeakChart } from "@/components/admin/features/analytics/hourlyPeakChart";
import { AnalyticsData } from "@/lib/services/admin.analytics.service";

export const metadata = {
  title: "Admin | Performance Analytics",
  description:
    "Granular sales volumes, category distributions, and kitchen peak hour loads.",
};

export default async function AdminAnalyticsPage() {
  const result = await fetchAdminAnalyticsData();

  if ("success" in result && !result.success) {
    throw new Error(result.error);
  }

  const data = result as AnalyticsData;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Analytics Controller
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Perform analytical checks on transaction volumes, product performance,
          and hourly operational peak flows.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <AnalyticsMetricCards kpis={data.kpis} />

      {/* Main charts section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-5">
          <InteractiveSalesChart data={data.salesOverTime} />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <CategoryDistribution data={data.categoryShare} />
        </div>
      </div>

      {/* Lower aggregation section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <TopSellingProducts data={data.topProducts} />
        <HourlyPeakChart data={data.hourlyDistribution} />
      </div>
    </div>
  );
}
