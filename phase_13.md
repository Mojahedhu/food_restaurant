# Complete Implementation Blueprint: Admin Analytics Dashboard

This document provides the full, production-ready source code for every file needed to implement the Admin Analytics Dashboard at `/admin/analytics`.

Adhering to the user's instructions, **no files in the workspace have been modified**. This document serves as a copy-pasteable blueprint for your manual implementation.

---

## 1. Directory Structure

Ensure the following files are created in your workspace:

```text
src/
├── actions/
│   └── admin-analytics.ts        # Server actions & data aggregation
├── app/
│   └── admin/
│       └── analytics/
│           └── page.tsx          # Next.js Server Page
└── components/
    └── admin/
        └── features/
            └── analytics/
                ├── AnalyticsMetricCards.tsx
                ├── InteractiveSalesChart.tsx
                ├── CategoryDistribution.tsx
                ├── TopSellingProducts.tsx
                └── HourlyPeakChart.tsx
```

---

## 2. Component and Action Codes

### A. Server Action: `src/actions/admin-analytics.ts`

This server action fetches orders and products from Sanity and aggregates them in-memory for fast, type-safe processing.

```typescript
"use server";

import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { assertAdmin } from "@/lib/auth-guard";
import { format, subDays, parseISO, getHours } from "date-fns";

export interface AnalyticsKPIs {
  totalRevenue: number;
  totalOrders: number;
  aov: number;
  completionRate: number;
}

export interface SalesPoint {
  date: string;
  revenue: number;
  orders: number;
  aov: number;
}

export interface ProductSale {
  name: string;
  sales: number;
  revenue: number;
}

export interface CategoryShare {
  name: string;
  value: number;
  color: string;
}

export interface HourlyLoad {
  hour: string;
  count: number;
}

export interface PaymentMethodPoint {
  method: string;
  count: number;
  value: number;
}

export interface AnalyticsData {
  kpis: AnalyticsKPIs;
  salesOverTime: SalesPoint[];
  topProducts: ProductSale[];
  categoryShare: CategoryShare[];
  hourlyDistribution: HourlyLoad[];
  paymentMethods: PaymentMethodPoint[];
}

export async function fetchAdminAnalyticsData(): Promise<
  AnalyticsData | { success: false; error: string }
> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;

  try {
    // 1. Query all orders from Sanity
    const ordersQuery = groq`*[_type == "order"] {
      _id,
      _createdAt,
      total,
      paymentStatus,
      paymentMethod,
      status->{ title, slug },
      items[] {
        foodId,
        name,
        price,
        quantity
      }
    }`;

    // 2. Query foods with their categories to map category revenue in memory
    const foodsQuery = groq`*[_type == "food"] {
      _id,
      "categoryName": category->name
    }`;

    const [orders, foods] = (await Promise.all([
      client.fetch(ordersQuery),
      client.fetch(foodsQuery),
    ])) as [any[], any[]];

    // Build food-to-category lookup map
    const foodCategoryMap = new Map<string, string>();
    foods.forEach((food) => {
      if (food._id && food.categoryName) {
        foodCategoryMap.set(food._id, food.categoryName);
      }
    });

    // 3. Filter orders
    const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
    const totalOrdersCount = orders.length;
    const paidOrdersCount = paidOrders.length;

    // 4. Calculate KPIs
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const aov =
      paidOrdersCount > 0
        ? Math.round((totalRevenue / paidOrdersCount) * 100) / 100
        : 0;

    // Completion rate represents orders with a "delivered" status
    const deliveredCount = orders.filter(
      (o) =>
        o.status?.slug?.current === "delivered" ||
        o.status?.title?.toLowerCase().includes("delivered"),
    ).length;
    const completionRate =
      totalOrdersCount > 0
        ? Math.round((deliveredCount / totalOrdersCount) * 100)
        : 0;

    // 5. Aggregate Sales over Time (Past 30 Days)
    const salesMap = new Map<string, { revenue: number; orders: number }>();
    for (let i = 29; i >= 0; i--) {
      const dateStr = format(subDays(new Date(), i), "yyyy-MM-dd");
      salesMap.set(dateStr, { revenue: 0, orders: 0 });
    }

    paidOrders.forEach((order) => {
      const dateStr = format(parseISO(order._createdAt), "yyyy-MM-dd");
      if (salesMap.has(dateStr)) {
        const current = salesMap.get(dateStr)!;
        salesMap.set(dateStr, {
          revenue: current.revenue + (order.total || 0),
          orders: current.orders + 1,
        });
      }
    });

    const salesOverTime: SalesPoint[] = [];
    salesMap.forEach((val, date) => {
      const displayDate = format(parseISO(date), "MMM dd");
      const dayAov =
        val.orders > 0 ? Math.round((val.revenue / val.orders) * 100) / 100 : 0;
      salesOverTime.push({
        date: displayDate,
        revenue: Math.round(val.revenue * 100) / 100,
        orders: val.orders,
        aov: dayAov,
      });
    });

    // 6. Aggregate Top Products (Paid orders)
    const productMap = new Map<string, { sales: number; revenue: number }>();
    paidOrders.forEach((order) => {
      (order.items || []).forEach((item: any) => {
        const name = item.name || "Unknown Product";
        const qty = item.quantity || 0;
        const rev = (item.price || 0) * qty;

        const current = productMap.get(name) || { sales: 0, revenue: 0 };
        productMap.set(name, {
          sales: current.sales + qty,
          revenue: current.revenue + rev,
        });
      });
    });

    const topProducts: ProductSale[] = Array.from(productMap.entries())
      .map(([name, data]) => ({
        name,
        sales: data.sales,
        revenue: Math.round(data.revenue * 100) / 100,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // 7. Aggregate Category Shares
    const categoryMap = new Map<string, number>();
    paidOrders.forEach((order) => {
      (order.items || []).forEach((item: any) => {
        const catName = foodCategoryMap.get(item.foodId) || "Other";
        const rev = (item.price || 0) * (item.quantity || 0);
        categoryMap.set(catName, (categoryMap.get(catName) || 0) + rev);
      });
    });

    const colors = [
      "#ea580c",
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ec4899",
      "#6b7280",
    ];
    const categoryShare: CategoryShare[] = Array.from(categoryMap.entries())
      .map(([name, value], idx) => ({
        name,
        value: Math.round(value * 100) / 100,
        color: colors[idx % colors.length],
      }))
      .sort((a, b) => b.value - a.value);

    // 8. Hourly Peak Load Analysis (All orders)
    const hourlyMap = new Map<number, number>();
    for (let h = 0; h < 24; h++) {
      hourlyMap.set(h, 0);
    }
    orders.forEach((order) => {
      const hour = getHours(parseISO(order._createdAt));
      hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
    });

    const hourlyDistribution: HourlyLoad[] = Array.from(
      hourlyMap.entries(),
    ).map(([hour, count]) => {
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      return {
        hour: `${displayHour} ${ampm}`,
        count,
      };
    });

    // 9. Payment Methods Breakdown
    const paymentMap = new Map<string, { count: number; value: number }>();
    paidOrders.forEach((order) => {
      const rawMethod = order.paymentMethod || "unknown";
      const displayMethod =
        rawMethod === "online"
          ? "Stripe Credit Card"
          : rawMethod === "cod"
            ? "Cash On Delivery"
            : "Wallet Balance";
      const current = paymentMap.get(displayMethod) || { count: 0, value: 0 };
      paymentMap.set(displayMethod, {
        count: current.count + 1,
        value: current.value + (order.total || 0),
      });
    });

    const paymentMethods: PaymentMethodPoint[] = Array.from(
      paymentMap.entries(),
    ).map(([method, data]) => ({
      method,
      count: data.count,
      value: Math.round(data.value * 100) / 100,
    }));

    return {
      kpis: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders: totalOrdersCount,
        aov,
        completionRate,
      },
      salesOverTime,
      topProducts,
      categoryShare,
      hourlyDistribution,
      paymentMethods,
    };
  } catch (error) {
    console.error("Failed to compile analytics data:", error);
    throw new Error("Failed to compile analytics data.");
  }
}
```

---

### B. Next.js Routing: `src/app/admin/analytics/page.tsx`

The server entry component that queries data and renders the bento grid analytics view.

```tsx
import { fetchAdminAnalyticsData } from "@/actions/admin-analytics";
import { AnalyticsMetricCards } from "@/components/admin/features/analytics/AnalyticsMetricCards";
import { InteractiveSalesChart } from "@/components/admin/features/analytics/InteractiveSalesChart";
import { CategoryDistribution } from "@/components/admin/features/analytics/CategoryDistribution";
import { TopSellingProducts } from "@/components/admin/features/analytics/TopSellingProducts";
import { HourlyPeakChart } from "@/components/admin/features/analytics/HourlyPeakChart";

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

  const data = result as any;

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
```

---

### C. UI Component: `src/components/admin/features/analytics/AnalyticsMetricCards.tsx`

Displays overall KPIs with modern gradients and micro-scale animations.

```tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import { AnalyticsKPIs } from "@/actions/admin-analytics";

interface AnalyticsMetricCardsProps {
  kpis: AnalyticsKPIs;
}

export function AnalyticsMetricCards({ kpis }: AnalyticsMetricCardsProps) {
  const cards = [
    {
      title: "Total Net Revenue",
      value: formatCurrency(kpis.totalRevenue),
      desc: "All settled orders",
      icon: DollarSign,
      color: "text-orange-600 bg-orange-50 dark:bg-orange-950/20",
      progress: 80,
    },
    {
      title: "Gross Orders",
      value: kpis.totalOrders,
      desc: "Total transaction counts",
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20",
      progress: 65,
    },
    {
      title: "Average Order Value",
      value: formatCurrency(kpis.aov),
      desc: "Avg spend per ticket",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20",
      progress: 72,
    },
    {
      title: "Fulfillment Rate",
      value: `${kpis.completionRate}%`,
      desc: "Completed delivery share",
      icon: CheckCircle2,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/20",
      progress: kpis.completionRate,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <Card
          key={card.title}
          className="border border-border/80 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-2"
          style={{ animationDelay: `${idx * 75}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl ${card.color}`}>
                <card.icon className="size-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold tracking-tight">
                {card.value}
              </span>
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </div>
            {/* Animated progress indicator bar */}
            <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${card.progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

### D. UI Component: `src/components/admin/features/analytics/InteractiveSalesChart.tsx`

Enables switching chart displays between Revenue, Orders volume, and AOV using smooth Area chart gradients.

```tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SalesPoint } from "@/actions/admin-analytics";
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

interface InteractiveSalesChartProps {
  data: SalesPoint[];
}

type MetricType = "revenue" | "orders" | "aov";

export function InteractiveSalesChart({ data }: InteractiveSalesChartProps) {
  const [metric, setMetric] = useState<MetricType>("revenue");

  const config = {
    revenue: {
      title: "Revenue Trends",
      color: "#EA580C",
      formatter: (v: number) => formatCurrency(v),
    },
    orders: {
      title: "Transaction Volume",
      color: "#3b82f6",
      formatter: (v: number) => `${v} orders`,
    },
    aov: {
      title: "Average Ticket Value",
      color: "#10b981",
      formatter: (v: number) => formatCurrency(v),
    },
  };

  return (
    <Card className="border border-border/80 shadow-xs h-[450px] animate-in fade-in duration-500">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold">
            Interactive Performance Trends
          </CardTitle>
          <CardDescription>
            Daily financial aggregates from the past 30 days.
          </CardDescription>
        </div>
        {/* Metric selection pill tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-center mt-2 sm:mt-0">
          {(Object.keys(config) as MetricType[]).map((type) => (
            <button
              key={type}
              onClick={() => setMetric(type)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                metric === type
                  ? "bg-white dark:bg-slate-900 text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="h-[330px] pr-4 relative">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground italic">
            No sales data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="metricColor" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={config[metric].color}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={config[metric].color}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
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
                tickFormatter={(value) =>
                  metric === "orders" ? value : `$${value}`
                }
                dx={-5}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload as SalesPoint;
                    return (
                      <div className="bg-white/95 dark:bg-slate-900/95 border border-border p-3.5 rounded-xl shadow-md text-xs space-y-1.5 backdrop-blur-xs">
                        <p className="font-semibold text-slate-950 dark:text-slate-50">
                          {point.date}
                        </p>
                        <p
                          className="font-medium"
                          style={{ color: config[metric].color }}
                        >
                          {config[metric].title}:{" "}
                          {config[metric].formatter(point[metric] as number)}
                        </p>
                        {metric !== "revenue" && (
                          <p className="text-muted-foreground">
                            Revenue: {formatCurrency(point.revenue)}
                          </p>
                        )}
                        {metric !== "orders" && (
                          <p className="text-muted-foreground">
                            Orders: {point.orders}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke={config[metric].color}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#metricColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### E. UI Component: `src/components/admin/features/analytics/CategoryDistribution.tsx`

Renders a modern Pie/Donut Chart showing category breakdown.

```tsx
"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryShare } from "@/actions/admin-analytics";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Sector, Tooltip, ResponsiveContainer } from "recharts";
import type { PieSectorShapeProps } from "recharts";
import { useState } from "react";
interface CategoryDistributionProps {
  data: CategoryShare[];
}
export function CategoryDistribution({ data }: CategoryDistributionProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const renderActiveShape = (props: PieSectorShapeProps) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      payload,
      isActive,
    } = props;
    // Get color dynamically from payload to avoid using deprecated <Cell> components
    const fill = (payload as CategoryShare)?.color || "#ea580c";
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={
            innerRadius ? (isActive ? innerRadius - 2 : innerRadius) : 0
          }
          outerRadius={
            outerRadius ? (isActive ? outerRadius + 4 : outerRadius) : 0
          }
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };
  return (
    <Card className="border border-border/80 shadow-xs h-[450px] animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Category Shares</CardTitle>
        <CardDescription>Overall breakdown by revenue values.</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px] flex items-center justify-center relative">
        {total === 0 ? (
          <div className="text-sm text-muted-foreground italic">
            No category data.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                shape={renderActiveShape as any}
                onMouseEnter={(_, idx) => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(undefined)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload as CategoryShare;
                    const percent =
                      total > 0 ? Math.round((point.value / total) * 100) : 0;
                    return (
                      <div className="bg-white dark:bg-slate-900 border border-border p-2.5 rounded-lg shadow-sm text-xs">
                        <p
                          className="font-semibold"
                          style={{ color: point.color }}
                        >
                          {point.name}
                        </p>
                        <p className="font-medium mt-0.5">
                          {formatCurrency(point.value)} ({percent}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
      {/* Dynamic legend listing categories */}
      <div className="px-6 pb-6 overflow-y-auto max-h-[110px] space-y-1.5">
        {data.map((item, idx) => (
          <div
            key={item.name}
            className={`flex items-center justify-between text-xs transition-opacity duration-200 ${
              activeIndex !== undefined && activeIndex !== idx
                ? "opacity-40"
                : "opacity-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium truncate max-w-[110px]">
                {item.name}
              </span>
            </div>
            <span className="text-muted-foreground">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

---

### F. UI Component: `src/components/admin/features/analytics/TopSellingProducts.tsx`

Renders a visual metric list of the best-selling menu items using progress bars.

```tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductSale } from "@/actions/admin-analytics";
import { formatCurrency } from "@/lib/utils";

interface TopSellingProductsProps {
  data: ProductSale[];
}

export function TopSellingProducts({ data }: TopSellingProductsProps) {
  const maxSales = data.length > 0 ? Math.max(...data.map((d) => d.sales)) : 1;

  return (
    <Card className="border border-border/80 shadow-xs h-[420px] animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="text-lg font-bold">
          Top Performing Products
        </CardTitle>
        <CardDescription>
          Best-selling dishes ranked by order quantities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {data.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground italic">
            No product sales logged.
          </div>
        ) : (
          data.map((prod, idx) => {
            const percentage = Math.round((prod.sales / maxSales) * 100);
            return (
              <div key={prod.name} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-400">
                      #{idx + 1}
                    </span>
                    <span className="font-medium truncate max-w-[180px] sm:max-w-xs">
                      {prod.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{prod.sales} sold</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(prod.revenue)}
                    </span>
                  </div>
                </div>
                {/* Horizontal progress bar representing comparative sales */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
```

---

### G. UI Component: `src/components/admin/features/analytics/HourlyPeakChart.tsx`

Renders a vertical Bar Chart representing order activity density by hour of day.

```tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HourlyLoad } from "@/actions/admin-analytics";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface HourlyPeakChartProps {
  data: HourlyLoad[];
}

export function HourlyPeakChart({ data }: HourlyPeakChartProps) {
  // Filters data to only include standard business hours or active periods to prevent chart cluttering
  // (e.g. 8 AM to 11 PM)
  const activeHoursData = data.filter((_, idx) => idx >= 8 && idx <= 23);

  return (
    <Card className="border border-border/80 shadow-xs h-[420px] animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="text-lg font-bold">
          Hourly Operational Load
        </CardTitle>
        <CardDescription>
          Kitchen order density mapped by hours of the day.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[290px] pr-4 relative">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground italic">
            No hourly tracking data.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeHoursData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                allowDecimals={false}
                dx={-5}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload as HourlyLoad;
                    return (
                      <div className="bg-white dark:bg-slate-900 border border-border p-2.5 rounded-lg shadow-sm text-xs">
                        <p className="font-semibold text-primary">
                          {point.hour}
                        </p>
                        <p className="font-medium mt-0.5">
                          {point.count} Orders received
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
```

B.2 Next.js Loading State: src/app/admin/analytics/loading.tsx
Renders a complete, high-fidelity skeleton page structure that prevents Cumulative Layout Shift (CLS) and provides a smooth page transition.

```tsx
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
      {/* Main Charts Skeletons */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Sales Chart Skeleton */}
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
        {/* Category Share Donut Skeleton */}
        <Card className="col-span-1 lg:col-span-2 border border-border/80 shadow-xs h-[450px]">
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center">
            <Skeleton className="size-40 rounded-full border-[15px] border-slate-100 dark:border-slate-800" />
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
      </div>
      {/* Lower Bento Skeletons */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Top Selling Products */}
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
        {/* Hourly Peak Load */}
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
      </div>
    </div>
  );
}
```
