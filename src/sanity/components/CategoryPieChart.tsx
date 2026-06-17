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

interface ChartDataItem extends CategoryDistributionItem {
  fill: string;
}

interface CategoryPieChartProps {
  distribution: CategoryDistributionItem[];
}

export function CategoryPieChart({ distribution }: CategoryPieChartProps) {
  const chartData: ChartDataItem[] = (distribution || [])
    ?.filter((c) => c.value > 0)
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
                `${name} ${((percent || 0) * 100).toFixed(0)}%`
              }
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
