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
interface OrderTrendsChartProps {
  trends: OrderTrendItem[];
}

export function OrderTrendsChart({ trends }: OrderTrendsChartProps) {
  // Format timestamps into clean dates for chart presentation
  const chartData: TrendsChartData[] =
    (trends || []).map((t) => ({
      date: new Date(t._createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      Revenue: t.total,
    })) || [];

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
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="date" stroke="#88888b" />
            <YAxis stroke="#88888b" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1c1c24",
                borderColor: "#2e2e3e",
              }}
            />
            <Line
              type="monotone"
              dataKey="Revenue"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
