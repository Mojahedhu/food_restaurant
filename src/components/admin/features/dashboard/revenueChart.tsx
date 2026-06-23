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
      className="col-span-4 border border-border shadow-xs transition-all ease-out transform animate-in fade-in slide-in-from-bottom-4 duration-500"
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
              vertical={true}
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
