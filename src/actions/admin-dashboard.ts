"use server";

import {
  DashboardStats,
  RecentActivity,
  RevenueChartPoint,
  StatusDistributionPoint,
} from "@/types/admin";
import { checkAdmin } from "@/lib/auth-guard";
import {
  fetchDashboardMetricsService,
  fetchDashboardRecentActivityService,
  fetchSalesTrendsChartDataService,
  fetchOrderStatusDistributionService,
} from "@/lib/services/admin.dashboard.service";

export async function fetchDashboardMetrics(): Promise<DashboardStats> {
  await checkAdmin();

  try {
    return await fetchDashboardMetricsService();
  } catch (error) {
    console.error("Failed to fetch dashboard metrics:", error);
    return { totalRevenue: 0, ordersCount: 0, usersCount: 0, aov: 0 };
  }
}

export async function fetchDashboardRecentActivity(): Promise<RecentActivity> {
  await checkAdmin();

  try {
    return await fetchDashboardRecentActivityService();
  } catch (error) {
    console.error("Failed to fetch dashboard recent activity:", error);
    return { recentOrders: [], newUsers: [], recentReviews: [] };
  }
}

export async function fetchSalesTrendsChartData(): Promise<RevenueChartPoint[]> {
  await checkAdmin();

  try {
    return await fetchSalesTrendsChartDataService();
  } catch (error) {
    console.error("Failed to compile sales trend chart data:", error);
    return [];
  }
}

export async function fetchOrderStatusDistribution(): Promise<StatusDistributionPoint[]> {
  await checkAdmin();

  try {
    return await fetchOrderStatusDistributionService();
  } catch (error) {
    console.error("Failed to fetch order status distribution:", error);
    return [];
  }
}
