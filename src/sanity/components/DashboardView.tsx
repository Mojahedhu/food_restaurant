import React from "react";
import { Spinner, Box, Grid, Flex } from "@sanity/ui";
import { useDashboardData } from "../hooks/useDashboardData";
import { MetricCards } from "./MetricCards";
import { OrderTrendsChart } from "./OrderTrendsChart";
import { CategoryPieChart } from "./CategoryPieChart";
import { TopFoodsChart } from "./TopFoodsChart";
import { ReviewStatsChart } from "./ReviewStatsChart";
import { ActivityList } from "./ActivityList";

export function DashboardView() {
  const { data, loading, error } = useDashboardData();

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

  if (error) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{ height: "100vh", background: "#0e0e11", color: "#ff4d4d" }}
      >
        <div>Error loading dashboard metrics: {error.message}</div>
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

        <Grid gridTemplateColumns={[1, 1, 2]} gap={4}>
          <OrderTrendsChart trends={data?.orderTrends || []} />
          <CategoryPieChart distribution={data?.categoryDistribution || []} />
        </Grid>

        <Grid gridTemplateColumns={[1, 1, 2]} gap={4}>
          <TopFoodsChart foods={data?.topFoods || []} />
          <ReviewStatsChart stats={data?.reviewStats} />
        </Grid>

        <ActivityList activities={data?.recentActivity || []} />
      </Flex>
    </Box>
  );
}
