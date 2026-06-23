# Phase 10: Dashboard Analytics & Performance Metrics Center

This phase replaces the placeholder dashboard landing page (`/admin`) with a stunning, premium **Dashboard Analytics & Performance Metrics Center**. It integrates server-side aggregated metrics, interactive time-series charts for sales trends, status distribution analytics, and tabbed recent activity streams.

All designs are built in compliance with the zero-trust, input validation, and crash elimination rules, as well as the new **Fluid transitions** and **Layout shift prevention** guidelines in [plan.md](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/plan.md).

---

## User Review Required

> [!IMPORTANT]
>
> - **Visual Bento Grid Layout:** The control center uses a modern bento-grid structure with animated cards, glassmorphic styling, and curated HSL theme colors.
> - **Interactive Recharts Visuals:** Uses custom Area and Pie charts to show daily sales over the past 30 days and order status splits.
> - **Tabbed Real-Time Activity Streams:** Features tabs to quickly inspect incoming orders, newly registered users, and recent customer reviews in real-time.
> - **Visual Layout Stability & Transitions:** Explicit minimum heights are set on dynamic widgets and charts to eliminate layout shifts (CLS), combined with smooth fade/slide entry transitions on load.

---

## Proposed Changes

### 1. Update Types (`src/types/admin.ts`)

Add structures for dashboard analytics, status counts, and historical data points.

#### [MODIFY] [admin.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/types/admin.ts)

```typescript
export interface DashboardStats {
  totalRevenue: number;
  ordersCount: number;
  usersCount: number;
  aov: number;
}

export interface RecentActivity {
  recentOrders: Array<{
    _id: string;
    _createdAt: string;
    orderNumber: string;
    userName: string;
    total: number;
    paymentStatus: string;
    status: {
      title: string;
      color: string;
    } | null;
  }>;
  newUsers: Array<{
    _id: string;
    _createdAt: string;
    name: string;
    email: string;
    image: any;
    role: {
      name: string;
    } | null;
  }>;
  recentReviews: Array<{
    _id: string;
    _createdAt: string;
    rating: number;
    comment: string;
    foodName: string;
    user: {
      name: string;
      image: any;
    } | null;
  }>;
}

export interface RevenueChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface StatusDistributionPoint {
  name: string;
  value: number;
  color: string;
}
```

---

### 2. Backend Dashboard Actions (`src/actions/admin-dashboard.ts`)

Create server actions to aggregate analytics, query recent events, and compile historical chart data.

#### [NEW] [admin-dashboard.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/actions/admin-dashboard.ts)

```typescript
"use server";

import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import {
  DashboardStats,
  RecentActivity,
  RevenueChartPoint,
  StatusDistributionPoint,
} from "@/types/admin";
import { groq } from "next-sanity";
import { format, subDays, startOfDay } from "date-fns";

export async function fetchDashboardMetrics(): Promise<DashboardStats> {
  try {
    const query = groq`{
      "totalRevenue": coalesce(sum(*[_type == "order" && paymentStatus == "paid"].total), 0),
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
        foodName,
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
  try {
    // Query orders from the last 30 days
    const minDate = format(subDays(new Date(), 30), "yyyy-MM-dd");
    const query = groq`*[_type == "order" && _createdAt >= $minDate] {
      _createdAt,
      total,
      paymentStatus
    }`;
    const { data: orders } = await sanityFetch({
      query,
      params: { minDate },
      tags: ["orders"],
    });

    // Initialize 30-day map
    const chartMap = new Map<string, { revenue: number; orders: number }>();
    for (let i = 29; i >= 0; i--) {
      const dateStr = format(subDays(new Date(), i), "MMM dd");
      chartMap.set(dateStr, { revenue: 0, orders: 0 });
    }

    // Populate chart data points
    (orders || []).forEach((order: any) => {
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
  try {
    const query = groq`*[_type == "orderStatus" && isActive == true] | order(order asc) {
      _id,
      title,
      color,
      "count": count(*[_type == "order" && status._ref == ^._id])
    }`;
    const { data: statuses } = await sanityFetch({
      query,
      params: {},
      tags: ["orderStatuses", "orders"],
    });

    return (statuses || []).map((st: any) => ({
      name: st.title || "Unknown",
      value: st.count || 0,
      color: st.color || "#94a3b8",
    }));
  } catch (error) {
    console.error("Failed to fetch order status distribution:", error);
    return [];
  }
}
```

---

### 3. Frontend Control Components (`src/components/admin/features/dashboard/`)

Implement the UI components for widgets, charting containers, and history lists.

#### [NEW] [dashboardMetricCards.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/dashboard/dashboardMetricCards.tsx)

Renders key indicator summaries with responsive animations, stable heights, and hover animations.

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, ShoppingBag, Users, Percent } from "lucide-react";
import { DashboardStats } from "@/types/admin";

interface DashboardMetricCardsProps {
  stats: DashboardStats;
}

export function DashboardMetricCards({ stats }: DashboardMetricCardsProps) {
  const items = [
    {
      title: "Total Sales",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color:
        "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400",
      description: "Direct revenue from paid checkout orders.",
    },
    {
      title: "Order Volumes",
      value: stats.ordersCount.toLocaleString(),
      icon: ShoppingBag,
      color: "text-primary bg-primary/10",
      description: "Aggregate transaction orders.",
    },
    {
      title: "Active Users",
      value: stats.usersCount.toLocaleString(),
      icon: Users,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400",
      description: "Registered consumer accounts.",
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(stats.aov),
      icon: Percent,
      color:
        "text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400",
      description: "Mean checkout basket valuation.",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card
            key={idx}
            className="overflow-hidden border border-border shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out transform opacity-0 translate-y-4 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
            style={{ animationDelay: `${idx * 75}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </p>
                  <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                    {item.value}
                  </p>
                </div>
                <div
                  className={`size-12 rounded-xl flex items-center justify-center ${item.color} shrink-0`}
                >
                  <Icon className="size-6" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {item.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

#### [NEW] [revenueChart.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/dashboard/revenueChart.tsx)

Displays historical sales and order frequencies. **Layout Shift Prevention:** Enforces explicit card structure heights (`h-[350px]`) so the layout remains completely stable before and after Recharts loads the SVG.

```tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RevenueChartPoint } from "@/types/admin";
import { formatCurrency } from "@/lib/utils";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface RevenueChartProps {
  data: RevenueChartPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card
      className="col-span-4 border border-border shadow-xs transition-all duration-500 ease-out transform opacity-0 translate-y-4 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
      style={{ animationDelay: "300ms" }}
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">
          Sales & Revenue Trends
        </CardTitle>
        <CardDescription>
          Daily revenue and transactional volumes from the past 30 days.
        </CardDescription>
      </CardHeader>
      {/* Fixed height container eliminates Cumulative Layout Shift (CLS) */}
      <CardContent className="h-[350px] pl-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EA580C" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
              dx={-5}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as RevenueChartPoint;
                  return (
                    <div className="bg-white/95 dark:bg-slate-900/95 border border-border p-3 rounded-xl shadow-md text-xs space-y-1 backdrop-blur-xs transition-all duration-200">
                      <p className="font-semibold text-slate-950 dark:text-slate-50">
                        {data.date}
                      </p>
                      <p className="text-primary font-bold">
                        Revenue: {formatCurrency(data.revenue)}
                      </p>
                      <p className="text-muted-foreground">
                        Orders: {data.orders}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#EA580C"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

#### [NEW] [statusPieChart.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/dashboard/statusPieChart.tsx)

Displays distribution charts grouped by order completion pipelines. **Layout Shift Prevention:** Enforces a layout-stable height (`h-[300px]`) for the canvas container.

```tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusDistributionPoint } from "@/types/admin";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface StatusPieChartProps {
  data: StatusDistributionPoint[];
}

export function StatusPieChart({ data }: StatusPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card
      className="col-span-4 lg:col-span-3 border border-border shadow-xs transition-all duration-500 ease-out transform opacity-0 translate-y-4 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
      style={{ animationDelay: "375ms" }}
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">
          Order Distribution
        </CardTitle>
        <CardDescription>
          Visual breakdown by operational pipeline status ({total} total).
        </CardDescription>
      </CardHeader>
      {/* Explicit height guarantees visual stability while rendering client-side SVG */}
      <CardContent className="h-[300px]">
        {total === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground italic">
            No order data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as StatusDistributionPoint;
                    const percent =
                      total > 0 ? Math.round((data.value / total) * 100) : 0;
                    return (
                      <div className="bg-white dark:bg-slate-900 border border-border p-2.5 rounded-lg shadow-sm text-xs">
                        <p
                          className="font-semibold"
                          style={{ color: data.color }}
                        >
                          {data.name}
                        </p>
                        <p className="font-medium mt-0.5">
                          {data.value} Orders ({percent}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
```

#### [NEW] [recentActivityFeed.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/dashboard/recentActivityFeed.tsx)

Displays tabs for recent orders, new users, and incoming ratings. **Layout Shift Prevention:** Enforces a rigid `min-h-[435px]` on each `TabsContent` pane, eliminating visual page jumps when switching tabs (which contain varied item volumes/heights). **Fluid Transitions:** Items transition smoothly with Tailwind CSS delay fades.

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecentActivity } from "@/types/admin";
import { formatCurrency, getUserImage } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { UserIcon, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";

interface RecentActivityFeedProps {
  activity: RecentActivity;
}

export function RecentActivityFeed({ activity }: RecentActivityFeedProps) {
  return (
    <Card
      className="col-span-4 border border-border shadow-xs transition-all duration-500 ease-out transform opacity-0 translate-y-4 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
      style={{ animationDelay: "450ms" }}
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">
          Recent System Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
            <TabsTrigger
              value="orders"
              className="hover:cursor-pointer transition-all duration-200"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="hover:cursor-pointer transition-all duration-200"
            >
              New Users
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="hover:cursor-pointer transition-all duration-200"
            >
              Reviews
            </TabsTrigger>
          </TabsList>

          {/* Orders Stream - min-h prevents CLS on tab toggle */}
          <TabsContent
            value="orders"
            className="space-y-4 outline-hidden min-h-[435px] transition-all duration-300 ease-in-out data-[state=inactive]:opacity-0 data-[state=active]:opacity-100"
          >
            {activity.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-12">
                No recent orders.
              </p>
            ) : (
              <div className="divide-y border border-border rounded-xl bg-background overflow-hidden">
                {activity.recentOrders.map((ord, idx) => (
                  <div
                    key={ord._id}
                    className="flex justify-between items-center p-4 hover:bg-slate-50/50 transition-colors duration-200 transform translate-x-4 opacity-0 animate-in fade-in slide-in-from-left-4 fill-mode-both"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex gap-3 items-center">
                      <div className="size-9 rounded-lg bg-secondary/80 flex items-center justify-center shrink-0">
                        <ShoppingBag className="size-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-900">
                          {ord.userName || "Unnamed User"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Order #{ord.orderNumber} •{" "}
                          {formatDistanceToNow(new Date(ord._createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm text-slate-950">
                        {formatCurrency(ord.total || 0)}
                      </div>
                      <Badge
                        variant="outline"
                        className="scale-90 font-normal mt-1 border-slate-200"
                      >
                        {ord.status?.title || "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* New Users Stream - min-h prevents CLS on tab toggle */}
          <TabsContent
            value="users"
            className="space-y-4 outline-hidden min-h-[435px] transition-all duration-300 ease-in-out data-[state=inactive]:opacity-0 data-[state=active]:opacity-100"
          >
            {activity.newUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-12">
                No recent sign-ups.
              </p>
            ) : (
              <div className="divide-y border border-border rounded-xl bg-background overflow-hidden">
                {activity.newUsers.map((user, idx) => {
                  const avatar = getUserImage(user);
                  return (
                    <div
                      key={user._id}
                      className="flex justify-between items-center p-4 hover:bg-slate-50/50 transition-colors duration-200 transform translate-x-4 opacity-0 animate-in fade-in slide-in-from-left-4 fill-mode-both"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex gap-3 items-center">
                        {/* Aspect Ratio Box prevents layout shifts */}
                        <div className="relative size-9 rounded-full border border-border bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 aspect-square">
                          {avatar ? (
                            <Image
                              src={avatar}
                              alt={user.name || "avatar"}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          ) : (
                            <UserIcon className="size-4.5 text-muted-foreground/60" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-900">
                            {user.name || "Unnamed User"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge
                          variant="secondary"
                          className="scale-90 font-normal"
                        >
                          {user.role?.name || "User"}
                        </Badge>
                        <div className="text-xxs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(user._createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Recent Reviews Stream - min-h prevents CLS on tab toggle */}
          <TabsContent
            value="reviews"
            className="space-y-4 outline-hidden min-h-[435px] transition-all duration-300 ease-in-out data-[state=inactive]:opacity-0 data-[state=active]:opacity-100"
          >
            {activity.recentReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-12">
                No recent reviews.
              </p>
            ) : (
              <div className="divide-y border border-border rounded-xl bg-background overflow-hidden">
                {activity.recentReviews.map((rev, idx) => {
                  const avatar = getUserImage(rev.user as any);
                  return (
                    <div
                      key={rev._id}
                      className="p-4 hover:bg-slate-50/50 transition-colors duration-200 transform translate-x-4 opacity-0 animate-in fade-in slide-in-from-left-4 fill-mode-both"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3 items-center">
                          {/* Aspect Ratio Box prevents layout shifts */}
                          <div className="relative size-8 rounded-full border border-border bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 aspect-square">
                            {avatar ? (
                              <Image
                                src={avatar}
                                alt={rev.user?.name || "avatar"}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            ) : (
                              <UserIcon className="size-4 text-muted-foreground/60" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-slate-900">
                              {rev.user?.name || "Anonymous"}
                            </div>
                            <div className="text-xxs text-muted-foreground mt-0.5">
                              {formatDistanceToNow(new Date(rev._createdAt), {
                                addSuffix: true,
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3.5 fill-current ${i >= rev.rating ? "opacity-20" : ""}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-xxs font-medium text-primary uppercase tracking-wider">
                          {rev.foodName}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          "{rev.comment}"
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

---

### 4. Control Page Integration (`src/app/admin/page.tsx`)

Replaces the placeholder view with parallel fetching server triggers. **Fluid Navigation:** Page components fade and slide in smoothly on viewport entry.

#### [MODIFY] [page.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/app/admin/page.tsx)

```tsx
import {
  fetchDashboardMetrics,
  fetchDashboardRecentActivity,
  fetchSalesTrendsChartData,
  fetchOrderStatusDistribution,
} from "@/actions/admin-dashboard";
import { DashboardMetricCards } from "@/components/admin/features/dashboard/dashboardMetricCards";
import { RevenueChart } from "@/components/admin/features/dashboard/revenueChart";
import { StatusPieChart } from "@/components/admin/features/dashboard/statusPieChart";
import { RecentActivityFeed } from "@/components/admin/features/dashboard/recentActivityFeed";

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
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 ease-out">
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
```

---
