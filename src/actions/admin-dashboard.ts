"use server";

import { sanityFetch } from "@/sanity/lib/live";
import {
  DashboardStats,
  RecentActivity,
  RevenueChartPoint,
  StatusDistributionPoint,
} from "@/types/admin";
import { groq } from "next-sanity";
import { format, subDays } from "date-fns";
import { checkAdmin } from "@/lib/auth-guard";

export async function fetchDashboardMetrics(): Promise<DashboardStats> {
  await checkAdmin();

  try {
    const query = groq`{
      "totalRevenue": coalesce(math::sum(*[_type == "order" && paymentStatus == "paid"].total), 0),
      "ordersCount": count(*[_type == "order"]),
      "usersCount": count(*[_type == "user"]),
      "aov": coalesce(math::avg(*[_type == "order" && paymentStatus == "paid"].total), 0)
    }`;
    const { data } = await sanityFetch({
      query,
      params: {},
      tags: ["orders", "users"],
    });
    return data as DashboardStats;
  } catch (error) {
    console.error("Failed to fetch dashboard metrics:", error);
    return { totalRevenue: 0, ordersCount: 0, usersCount: 0, aov: 0 };
  }
}

export async function fetchDashboardRecentActivity(): Promise<RecentActivity> {
  await checkAdmin();

  try {
    const query = groq`{
      "recentOrders": *[_type == "order"] | order(_createdAt desc)[0...5] {
        _id,
        _createdAt,
        orderNumber,
        userName,
        total,
        paymentStatus,
        status->{ title, color }
      },
      "newUsers": *[_type == "user"] | order(_createdAt desc)[0...5] {
        _id,
        _createdAt,
        name,
        email,
        image,
        role->{ name }
      },
      "recentReviews": *[_type == "review"] | order(_createdAt desc)[0...5] {
        _id,
        _createdAt,
        rating,
        comment,
        "foodName": food->name,
        user->{ name, image }
      }
    }`;
    const { data } = await sanityFetch({
      query,
      params: {},
      tags: ["orders", "users", "reviews"],
    });
    return data as RecentActivity;
  } catch (error) {
    console.error("Failed to fetch dashboard recent activity:", error);
    return { recentOrders: [], newUsers: [], recentReviews: [] };
  }
}

export async function fetchSalesTrendsChartData(): Promise<
  RevenueChartPoint[]
> {
  await checkAdmin();

  try {
    // Query orders from the last 30 days
    const minDate = format(subDays(new Date(), 30), "yyyy-MM-dd");
    const query = groq`*[_type == "order" && _createdAt >= $minDate] {
      _createdAt,
      total,
      paymentStatus
    }`;
    const { data: orders } = (await sanityFetch({
      query,
      params: { minDate },
      tags: ["orders"],
    })) as {
      data: { _createdAt: string; total: number; paymentStatus: string }[];
    };

    // Initialize 30-day map
    const chartMap = new Map<string, { revenue: number; orders: number }>();
    for (let i = 29; i >= 0; i--) {
      const dateStr = format(subDays(new Date(), i), "MMM dd");
      chartMap.set(dateStr, { revenue: 0, orders: 0 });
    }

    // Populate chart data points
    (orders || []).forEach((order) => {
      const dateStr = format(new Date(order._createdAt), "MMM dd");
      if (chartMap.has(dateStr)) {
        const val = chartMap.get(dateStr)!;
        const amt = order.paymentStatus === "paid" ? order.total || 0 : 0;
        chartMap.set(dateStr, {
          revenue: val.revenue + amt,
          orders: val.orders + 1,
        });
      }
    });

    const chartData: RevenueChartPoint[] = [];
    chartMap.forEach((val, date) => {
      chartData.push({
        date,
        revenue: Math.round(val.revenue * 100) / 100,
        orders: val.orders,
      });
    });

    return chartData;
  } catch (error) {
    console.error("Failed to compile sales trend chart data:", error);
    return [];
  }
}

export async function fetchOrderStatusDistribution(): Promise<
  StatusDistributionPoint[]
> {
  await checkAdmin();

  try {
    const query = groq`*[_type == "orderStatus" && isActive == true] | order(order asc) {
      _id,
      title,
      color,
      "count": count(*[_type == "order" && status._ref == ^._id])
    }`;
    const { data: statuses } = (await sanityFetch({
      query,
      params: {},
      tags: ["orderStatuses", "orders"],
    })) as {
      data: { _id: string; title: string; color: string; count: number }[];
    };

    return (statuses || []).map((st) => ({
      name: st.title || "Unknown",
      value: st.count || 0,
      color: st.color || "#94a3b8",
      fill: st.color || "#94a3b8",
    }));
  } catch (error) {
    console.error("Failed to fetch order status distribution:", error);
    return [];
  }
}
