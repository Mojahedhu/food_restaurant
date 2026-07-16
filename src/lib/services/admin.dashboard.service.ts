import { sanityFetch } from "@/sanity/lib/live";
import {
  DashboardStats,
  RecentActivity,
  RevenueChartPoint,
  StatusDistributionPoint,
} from "@/types/admin";
import { groq } from "next-sanity";
import { format, subDays } from "date-fns";

export async function fetchDashboardMetricsService(): Promise<DashboardStats> {
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
}

export async function fetchDashboardRecentActivityService(): Promise<RecentActivity> {
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
}

export async function fetchSalesTrendsChartDataService(): Promise<RevenueChartPoint[]> {
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

  const chartMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 29; i >= 0; i--) {
    const dateStr = format(subDays(new Date(), i), "MMM dd");
    chartMap.set(dateStr, { revenue: 0, orders: 0 });
  }

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
}

export async function fetchOrderStatusDistributionService(): Promise<StatusDistributionPoint[]> {
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
}
