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
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 400, height: 300 }}
          >
            <BarChart
              data={activeHoursData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e228f0" />
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
