# Custom Sanity Studio Dashboard

This implementation plan describes how to design and build a premium, custom dashboard tool inside Sanity Studio matching the exact visual layout from the reference images.

## User Review Required

> [!IMPORTANT]
> The custom dashboard will be integrated directly into the Sanity Studio configuration as a custom tool, rendering alongside the standard "Structure" and "Vision" tabs. It will dynamically fetch real-time metrics, trend data, and recent activities using GROQ queries against the existing Sanity dataset.
>
> To support smooth and interactive charts, we recommend using standard SVG-based charts or adding `recharts` to the project's dependency list.

## Open Questions

- **Chart Library Preference**: Would you prefer a lightweight dependency like `recharts` for highly interactive charts, or custom hand-coded SVG charts to keep the build size minimal? (The plan details both options, recommending Recharts for premium aesthetics).

---

## Proposed Changes

To build the dashboard without disrupting other tools, we will register a custom Sanity Studio tool named `dashboard` using Sanity's `defineConfig` extension capabilities.

### 1. Define Dashboard Core Views & Custom Tool

#### [NEW] [DashboardView.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/sanity/components/DashboardView.tsx)

This React component will be the entrypoint for the dashboard tool. It will use Sanity's `useClient` hook to fetch data in real-time, handle loading/error states gracefully, and manage layout organization.

```tsx
import React, { useEffect, useState } from "react";
import { useClient } from "sanity";
import { Card, Text, Grid, Flex, Box, Spinner } from "@sanity/ui";
import { ActivityList } from "./ActivityList";
import { MetricCards } from "./MetricCards";
import { OrderTrends } from "./OrderTrends";
import { CategoryDistribution } from "./CategoryDistribution";
import { TopFoods } from "./TopFoods";
import { ReviewStats } from "./ReviewStats";

export function DashboardView() {
  const client = useClient({ apiVersion: "2023-01-01" });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const query = `{
          "foodItemsCount": count(*[_type == "food"]),
          "ordersCount": count(*[_type == "order"]),
          "customersCount": count(*[_type == "user"]),
          "reviewsCount": count(*[_type == "review"]),
          "categoriesCount": count(*[_type == "category"]),
          "bannersCount": count(*[_type == "banner"]),
          "categoryDistribution": *[_type == "category"] {
            title,
            "count": count(*[_type == "food" && references(^._id)])
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
        const res = await client.fetch(query);
        setData(res);
      } catch (err) {
        console.error("Failed fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [client]);

  if (loading) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{ height: "100vh", background: "#0e0e11" }}
      >
        <Spinner size={3} />
      </Flex>
    );
  }

  return (
    <Box
      style={{
        background: "#0e0e11",
        color: "#fff",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <Flex direction="column" gap={4}>
        <MetricCards data={data} />

        <Grid columns={[1, 1, 2]} gap={4}>
          <OrderTrends trends={data?.orderTrends} />
          <CategoryDistribution distribution={data?.categoryDistribution} />
        </Grid>

        <Grid columns={[1, 1, 2]} gap={4}>
          <TopFoods foods={data?.topFoods} />
          <ReviewStats stats={data?.reviewStats} />
        </Grid>

        <ActivityList activities={data?.recentActivity} />
      </Flex>
    </Box>
  );
}
```

#### [NEW] [MetricCards.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/sanity/components/MetricCards.tsx)

Renders the 6 responsive, beautifully colored summary cards with appropriate emojis and counts:

```tsx
import React from "react";

export function MetricCards({ data }: { data: any }) {
  const cards = [
    {
      title: "Total Food Items",
      val: data?.foodItemsCount || 0,
      bg: "linear-gradient(135deg, #4f46e5, #3b82f6)",
      emoji: "🍔",
    },
    {
      title: "Total Orders",
      val: data?.ordersCount || 0,
      bg: "linear-gradient(135deg, #10b981, #059669)",
      emoji: "📦",
    },
    {
      title: "Customers",
      val: data?.customersCount || 0,
      bg: "linear-gradient(135deg, #f59e0b, #d97706)",
      emoji: "👥",
    },
    {
      title: "Reviews",
      val: data?.reviewsCount || 0,
      bg: "linear-gradient(135deg, #ef4444, #dc2626)",
      emoji: "⭐",
    },
    {
      title: "Categories",
      val: data?.categoriesCount || 0,
      bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
      emoji: "📁",
    },
    {
      title: "Active Banners",
      val: data?.bannersCount || 0,
      bg: "linear-gradient(135deg, #ec4899, #db2777)",
      emoji: "📢",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px",
      }}
    >
      {cards.map((c, i) => (
        <div
          key={i}
          style={{
            background: c.bg,
            borderRadius: "12px",
            padding: "20px",
            color: "#fff",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>{c.emoji}</div>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>{c.title}</div>
          <div
            style={{ fontSize: "32px", fontWeight: "bold", marginTop: "4px" }}
          >
            {c.val}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 2. Connect Dashboard to Sanity Config

#### [MODIFY] [sanity.config.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/sanity.config.ts)

Register the custom dashboard view as a custom tool in the configuration file:

```typescript
import { DashboardIcon } from "@sanity/icons";
import { DashboardView } from "./src/sanity/components/DashboardView";

export default defineConfig({
  // ...
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  tools: (prev) => [
    {
      name: "dashboard",
      title: "Dashboard",
      icon: DashboardIcon,
      component: DashboardView,
    },
    ...prev,
  ],
});
```

---

## Verification Plan

### Automated Tests

- Since this is a custom Sanity view component, verify the GROQ queries run error-free inside the Sanity Vision Tool using the query strings listed in `DashboardView.tsx`.

### Manual Verification

1. Launch the local Sanity development server:
   ```bash
   pnpm dev
   ```
2. Navigate to `http://localhost:3000/studio-quick-food`.
3. Confirm that the new "Dashboard" tab is visible in the top bar.
4. Verify all KPI card counts match real document numbers in the database.
5. Check that the pie chart, line chart, bar charts, and recent activity render correctly under dark theme.
