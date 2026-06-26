"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusDistributionPoint } from "@/types/admin";
import { useEffect, useState } from "react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector,
} from "recharts";
import type { PieSectorShapeProps } from "recharts";

interface StatusPieChartProps {
  data: StatusDistributionPoint[];
}

export function StatusPieChart({ data }: StatusPieChartProps) {
  const [mounted, setMounted] = useState(false);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <Card
      className="col-span-4 lg:col-span-3 border border-border shadow-xs transition-all ease-out transform animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationDelay: "375ms" }}
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">
          Order Distribution
        </CardTitle>
        <CardDescription>
          Visual breakdown by operational pipeline status ({total} total).
        </CardDescription>
      </CardHeader>
      {/* Explicit height guarantees visual stability while rendering client-side SVG */}
      <CardContent className="h-[300px]">
        {total === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground italic">
            No order data available.
          </div>
        ) : !mounted ? (
          <div className="h-full w-full bg-slate-50/50 dark:bg-slate-900/50 animate-pulse rounded-lg" />
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
            minHeight={0}
            minWidth={0}
            initialDimension={{ width: 400, height: 300 }} // Default server fallback
          >
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                shape={(props: PieSectorShapeProps) => (
                  <Sector {...props} fill={props.fill} />
                )}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as StatusDistributionPoint;
                    const percent =
                      total > 0 ? Math.round((data.value / total) * 100) : 0;
                    return (
                      <div className="bg-white dark:bg-slate-900 border border-border p-2.5 rounded-lg shadow-sm text-xs">
                        <p
                          className="font-semibold"
                          style={{ color: data.color }}
                        >
                          {data.name}
                        </p>
                        <p className="font-medium mt-0.5">
                          {data.value} Orders ({percent}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
