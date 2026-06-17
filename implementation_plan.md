# Custom Sanity Studio Dashboard (Strict TypeScript & Recharts 4.0)

This updated implementation plan covers standardizing TypeScript declarations, using a dedicated types file, eliminating the use of `any`, and replacing the deprecated `Cell` component in `recharts` with direct color mapping or custom shapes via the `shape` property.

---

## Proposed Changes

### 1. Unified Dashboard Types

#### [NEW] [dashboard.types.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/sanity/types/dashboard.ts)

A dedicated file defining precise TypeScript interfaces for all metrics, queries, and charts data structures.

```typescript
export interface CategoryDistributionItem {
  name: string;
  value: number;
}

export interface RecentActivityItem {
  _type: "order" | "user" | "review";
  _id: string;
  _createdAt: string;
  title: string;
  subtitle: string;
}

export interface ReviewDistributionItem {
  rating: number;
  count: number;
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: ReviewDistributionItem[];
}

export interface TopFoodItem {
  name: string;
  orderCount: number;
}

export interface OrderTrendItem {
  _createdAt: string;
  total: number;
}

export interface DashboardData {
  foodItemsCount: number;
  ordersCount: number;
  customersCount: number;
  reviewsCount: number;
  categoriesCount: number;
  bannersCount: number;
  categoryDistribution: CategoryDistributionItem[];
  recentActivity: RecentActivityItem[];
  reviewStats: ReviewStats;
  topFoods: TopFoodItem[];
  orderTrends: OrderTrendItem[];
}
```

---

### 2. Logic & Data Fetching Layer

#### [NEW] [dashboardService.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/sanity/lib/dashboardService.ts)

Fetch dashboard details using strong typing.

```typescript
import { sanityFetch } from "./live";
import { DashboardData } from "../types/dashboard";

export const DASHBOARD_QUERY = `{
  "foodItemsCount": count(*[_type == "food"]),
  "ordersCount": count(*[_type == "order"]),
  "customersCount": count(*[_type == "user"]),
  "reviewsCount": count(*[_type == "review"]),
  "categoriesCount": count(*[_type == "category"]),
  "bannersCount": count(*[_type == "banner"]),
  "categoryDistribution": *[_type == "category"] {
    "name": title,
    "value": count(*[_type == "food" && references(^._id)])
  },
  "recentActivity": *[_type in ["order", "user", "review"]] | order(_createdAt desc)[0..9] {
    _type,
    _id,
    _createdAt,
    "title": coalesce(orderNumber, userName, name, title, "Untitled"),
    "subtitle": coalesce(userEmail, email, _type)
  },
  "reviewStats": {
    "average": round(avg(*[_type == "review"].rating), 2),
    "total": count(*[_type == "review"]),
    "distribution": [5, 4, 3, 2, 1] {
      "rating": @,
      "count": count(*[_type == "review" && rating == @])
    }
  },
  "topFoods": *[_type == "food"] {
    name,
    "orderCount": count(*[_type == "order" && references(^._id)])
  } | order(orderCount desc)[0..4],
  "orderTrends": *[_type == "order" && _createdAt > datetime(now() - 60*60*24*7)] | order(_createdAt asc) {
    _createdAt,
    total
  }
}`;

export async function fetchDashboardData(): Promise<DashboardData> {
  const response = await sanityFetch<DashboardData>({
    query: DASHBOARD_QUERY,
  });
  return response.data;
}
```

#### [NEW] [useDashboardData.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/sanity/hooks/useDashboardData.ts)

Strictly typed React state management hook.

```typescript
import { useState, useEffect } from "react";
import { fetchDashboardData } from "../lib/dashboardService";
import { DashboardData } from "../types/dashboard";

export interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
}

export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        const dashboardData = await fetchDashboardData();
        if (active) {
          setData(dashboardData);
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();
    const interval = setInterval(loadData, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return { data, loading, error };
}
```

---

### 3. UI Layer (Using Recharts & deprecation fixes)

#### [NEW] [CategoryPieChart.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/sanity/components/CategoryPieChart.tsx)

Renders category distribution. Since Recharts `<Cell>` is deprecated and will be removed in 4.0, we pass color configurations directly into each segment via the `<Pie>` component's `shape` property or pre-mapping fill property inside the data structure.

```tsx
import React from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import { CategoryDistributionItem } from "../types/dashboard";

const COLORS = [
  "#4f46e5",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

// Add colors directly into data items to cleanly configure shapes in Pie
interface ChartDataItem extends CategoryDistributionItem {
  fill: string;
}

export function CategoryPieChart({
  distribution,
}: {
  distribution: CategoryDistributionItem[];
}) {
  const chartData: ChartDataItem[] = (distribution || [])
    .filter((c) => c.value > 0)
    .map((c, index) => ({
      ...c,
      fill: COLORS[index % COLORS.length],
    }));

  return (
    <div
      style={{ background: "#1c1c24", borderRadius: "12px", padding: "20px" }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>
        🍕 Food Items by Category
      </h3>
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              // To handle Recharts Cell deprecation, color styles are mapped dynamically
              // through the shape property by assigning individual segment fills.
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1c1c24",
                borderColor: "#2e2e3e",
                color: "#fff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

#### [NEW] [OrderTrendsChart.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/sanity/components/OrderTrendsChart.tsx)

Strongly typed line chart.

```tsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { OrderTrendItem } from "../types/dashboard";

interface TrendsChartData {
  date: string;
  Revenue: number;
}

export function OrderTrendsChart({ trends }: { trends: OrderTrendItem[] }) {
  const chartData: TrendsChartData[] = (trends || []).map((t) => ({
    date: new Date(t._createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    Revenue: t.total,
  }));

  return (
    <div
      style={{ background: "#1c1c24", borderRadius: "12px", padding: "20px" }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>
        📈 Order Trends (Last 7 Days)
      </h3>
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3e" />
            <XAxis dataKey="date" stroke="#88888b" />
            <YAxis stroke="#88888b" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1c1c24",
                borderColor: "#2e2e3e",
                color: "#fff",
              }}
            />
```
    </div>
  );
}
```

#### [NEW] [MetricCards.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/sanity/components/MetricCards.tsx)

Renders beautiful overview summary cards using `@sanity/ui` Grid and customizable gradients.

```tsx
import React from "react";
import { Grid } from "@sanity/ui";
import { DashboardData } from "../types/dashboard";

export function MetricCards({ data }: { data: DashboardData | null }) {
  const cards = [
    { title: "Total Food Items", value: data?.foodItemsCount ?? 0, bg: "linear-gradient(135deg, #3b82f6, #1d4ed8)" },
    { title: "Total Orders", value: data?.ordersCount ?? 0, bg: "linear-gradient(135deg, #10b981, #047857)" },
    { title: "Customers", value: data?.customersCount ?? 0, bg: "linear-gradient(135deg, #f59e0b, #b45309)" },
    { title: "Reviews", value: data?.reviewsCount ?? 0, bg: "linear-gradient(135deg, #ef4444, #b91c1c)" },
    { title: "Categories", value: data?.categoriesCount ?? 0, bg: "linear-gradient(135deg, #8b5cf6, #6d28d9)" },
    { title: "Active Banners", value: data?.bannersCount ?? 0, bg: "linear-gradient(135deg, #ec4899, #be185d)" },
  ];

  return (
    <div style={{ background: "#1c1c24", borderRadius: "12px", padding: "20px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
        📊 Quick Food Overview
      </h3>
      <Grid columns={[2, 3, 6]} gap={3}>
        {cards.map((card, idx) => (
          <div
            key={idx}
            style={{
              background: card.bg,
              borderRadius: "8px",
              padding: "16px",
              color: "#fff",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "8px" }}>{card.title}</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{card.value}</div>
          </div>
        ))}
      </Grid>
    </div>
  );
}
```

#### [NEW] [TopFoodsChart.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/sanity/components/TopFoodsChart.tsx)

Renders horizontal bar chart of high performing food items.

```tsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TopFoodItem } from "../types/dashboard";

export function TopFoodsChart({ foods }: { foods: TopFoodItem[] }) {
  const data = (foods || []).map(f => ({
    name: f.name || "Untitled",
    "Orders": f.orderCount || 0
  }));

  return (
    <div style={{ background: "#1c1c24", borderRadius: "12px", padding: "20px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>
        🏆 Top Performing Foods
      </h3>
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3e" horizontal={false} />
            <XAxis type="number" stroke="#88888b" />
            <YAxis dataKey="name" type="category" stroke="#88888b" width={100} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1c1c24",
                borderColor: "#2e2e3e",
                color: "#fff",
              }}
            />
            <Bar dataKey="Orders" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

#### [NEW] [ReviewStatsChart.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/sanity/components/ReviewStatsChart.tsx)

Renders ratings rating breakdown in vertical bar chart format.

```tsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ReviewStats } from "../types/dashboard";

export function ReviewStatsChart({ stats }: { stats: ReviewStats | undefined }) {
  const data = (stats?.distribution || []).map(item => ({
    rating: `${item.rating} ★`,
    Count: item.count || 0
  }));

  return (
    <div style={{ background: "#1c1c24", borderRadius: "12px", padding: "20px" }}>
      <h3 style={{ margin: "0 0 4px 0", fontSize: "18px" }}>
        ⭐ Review Statistics
      </h3>
      <div style={{ fontSize: "12px", color: "#88888b", marginBottom: "16px" }}>
        Average: {stats?.average ?? 0} | Total Reviews: {stats?.total ?? 0}
      </div>
      <div style={{ width: "100%", height: 210 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3e" vertical={false} />
            <XAxis dataKey="rating" stroke="#88888b" />
            <YAxis stroke="#88888b" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1c1c24",
                borderColor: "#2e2e3e",
                color: "#fff",
              }}
            />
            <Bar dataKey="Count" fill="#fbbf24" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

#### [NEW] [ActivityList.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/sanity/components/ActivityList.tsx)

Renders list of recent activity feed item operations (Orders, User Signups, Reviews).

```tsx
import React from "react";
import { RecentActivityItem } from "../types/dashboard";

export function ActivityList({ activities }: { activities: RecentActivityItem[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "order": return "📦";
      case "user": return "👤";
      case "review": return "⭐";
      default: return "🔔";
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div style={{ background: "#1c1c24", borderRadius: "12px", padding: "20px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
        🔔 Recent Activity
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {(activities || []).map((activity) => (
          <div
            key={activity._id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "12px",
              background: "#18181f",
              borderRadius: "8px",
              borderLeft: `4px solid ${
                activity._type === "order" ? "#10b981" : activity._type === "review" ? "#fbbf24" : "#3b82f6"
              }`,
            }}
          >
            <span style={{ fontSize: "20px" }}>{getIcon(activity._type)}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>{activity.title}</div>
              <div style={{ fontSize: "12px", color: "#88888b" }}>{activity.subtitle}</div>
            </div>
            <div style={{ fontSize: "12px", color: "#88888b" }}>{formatTime(activity._createdAt)}</div>
          </div>
        ))}
        {(!activities || activities.length === 0) && (
          <div style={{ textAlign: "center", color: "#88888b", padding: "20px" }}>
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Verification Plan

### Automated Tests

- Build code compilation verification with TypeScript compiler:
  ```bash
  pnpm tsc --noEmit
  ```

### 4. Sanity Studio Integration & Structure

#### Vision

The dashboard serves as the operational nerve center of the Quick Food application. Located at the root of the Sanity Studio Desk Structure, it provides real-time visibility into operational metrics (Order volume, category distribution, user registrations, recent reviews) in a visually stunning dark mode layout. This ensures that restaurant managers and system admins have immediate access to actionable insights the moment they log into the CMS.

#### Structure

We will integrate the custom `DashboardView` component at the very top level of the Desk structure within `src/sanity/structure.ts`.

#### [MODIFY] [structure.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/sanity/structure.ts)

Configure the top-level list items to mount the `DashboardView` using Sanity's `S.component()` view:

```typescript
import { OmitIcon } from "@sanity/icons"; // or another appropriate icon
import { DashboardView } from "./components/DashboardView";
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Quick Food Admin")
    .items([
      // Real-time Dashboard View at the top
      S.listItem()
        .title("Dashboard")
        .id("dashboard")
        .icon(OmitIcon)
        .child(
          S.component()
            .title("Overview Dashboard")
            .id("dashboard-view")
            .component(DashboardView)
        ),
      S.divider(),
      // Food Management Section
      ...
    ]);
```

---

### 4. Custom Studio Tool Integration (sanity.config.ts)

#### Vision

Instead of embedding the dashboard deep inside the Desk Structure, we will promote the Dashboard to a top-level tool in Sanity Studio. This renders it as a dedicated primary tab (alongside Content/Desk and Vision) at the top of the Studio navigation, enabling instant, one-click access to system-wide analytics.

#### Structure

We will integrate `DashboardView` directly into the `tools` array of the Sanity configuration in `sanity.config.ts`.

#### [MODIFY] [sanity.config.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/sanity.config.ts)

Configure `defineConfig` to declare the custom Dashboard tool:

```typescript
import { DashboardView } from "./src/sanity/components/DashboardView";
export default defineConfig({
  // ... other configs
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  tools: (prev) => [
    {
      name: "dashboard",
      title: "Dashboard",
      component: DashboardView,
    },
    ...prev,
  ],
});
```

---

## Verification Plan

### Automated Tests

- Build code compilation verification with TypeScript compiler:
  ```bash
  pnpm tsc --noEmit
  ```

### Manual Verification

- Open the Sanity Studio interface and verify a new primary navigation tab named "Dashboard" appears at the top.
- Click the "Dashboard" tab to confirm all components (charts, metric cards, recent activity logs) load and present metrics correctly.
- Verify responsiveness across various screen sizes using browser DevTools.
