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
import { ReviewStats } from "../types/dashboard";

export function ReviewStatsChart({
  stats,
}: {
  stats: ReviewStats | undefined;
}) {
  const data = (stats?.distribution || []).map((item) => ({
    rating: `${item.rating} ★`,
    Count: item.count || 0,
  }));
  // const data = (stats?.distribution || [])
  //   .filter((item) => item !== null && item !== undefined)
  //   .map((item) => ({
  //     rating: `${item.rating} ★`,
  //     Count: item.count || 0,
  //   }));

  return (
    <div
      style={{ background: "#1c1c24", borderRadius: "12px", padding: "20px" }}
    >
      <h3 style={{ margin: "0 0 4px 0", fontSize: "18px" }}>
        ⭐ Review Statistics
      </h3>
      <div style={{ fontSize: "12px", color: "#88888b", marginBottom: "16px" }}>
        Average: {stats?.average ?? 0} | Total Reviews: {stats?.total ?? 0}
      </div>
      <div style={{ width: "100%", height: 210 }}>
        <ResponsiveContainer width={"90%"}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#eee"
              syncWithTicks={true}
            />
            <XAxis
              dataKey="rating"
              stroke="#88888b"
              tick={{ fill: "#FFC83D" }}
            />
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
