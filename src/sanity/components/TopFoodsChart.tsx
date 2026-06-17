import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TopFoodItem } from "../types/dashboard";

export function TopFoodsChart({ foods }: { foods: TopFoodItem[] }) {
  const data = (foods || []).map((f) => ({
    name: f.name || "Untitled",
    Orders: f.orderCount || 0,
  }));

  return (
    <div
      style={{ background: "#1c1c24", borderRadius: "12px", padding: "20px" }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>
        🏆 Top Performing Foods
      </h3>
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 20, right: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis type="number" stroke="#88888b" />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#88888b"
              width={100}
            />
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
