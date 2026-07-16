"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
import { SalesPoint } from "@/lib/services/admin.analytics.service";

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
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 400, height: 300 }}
          >
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
              <CartesianGrid strokeDasharray="3 3" stroke="#e228f0" />
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
