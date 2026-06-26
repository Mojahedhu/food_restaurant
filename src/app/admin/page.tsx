import {
  fetchDashboardMetrics,
  fetchDashboardRecentActivity,
  fetchSalesTrendsChartData,
  fetchOrderStatusDistribution,
} from "@/actions/admin-dashboard";
import { DashboardMetricCards } from "@/components/admin/features/dashboard/dashboardMetricCards";
import { RecentActivityFeed } from "@/components/admin/features/dashboard/recentActivityFeed";
import { RevenueChart } from "@/components/admin/features/dashboard/revenueChart";
import { StatusPieChart } from "@/components/admin/features/dashboard/statusPieChart";

export const metadata = {
  title: "Admin | Dashboard Control Center",
  description:
    "Aggregated performance analytics, revenue tracking, and system operational streams.",
};

export default async function AdminDashboardPage() {
  const [stats, activity, chartData, statusDistribution] = await Promise.all([
    fetchDashboardMetrics(),
    fetchDashboardRecentActivity(),
    fetchSalesTrendsChartData(),
    fetchOrderStatusDistribution(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Control Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your branch performance, sales volumes, customer
          registrations, and reviews.
        </p>
      </div>

      {/* Numerical Metrics Grid */}
      <DashboardMetricCards stats={stats} />

      {/* Graphical Bento Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Sales Area Chart (Span 4) */}
        <RevenueChart data={chartData} />

        {/* Status Distribution Pie Chart (Span 3) */}
        <StatusPieChart data={statusDistribution} />
      </div>

      {/* Lower Feed Bento Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        {/* Recent Events Tabbed Stream (Span 4) */}
        <RecentActivityFeed activity={activity} />
      </div>
    </div>
  );
}
