"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryShare } from "@/lib/services/admin.analytics.service";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Sector, Tooltip, ResponsiveContainer } from "recharts";
import type { PieSectorShapeProps } from "recharts";
import { useState } from "react";
interface CategoryDistributionProps {
  data: CategoryShare[];
}
export function CategoryDistribution({ data }: CategoryDistributionProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const renderActiveShape = (props: PieSectorShapeProps) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      payload,
      isActive,
    } = props;
    // Get color dynamically from payload to avoid using deprecated <Cell> components
    const fill = (payload as CategoryShare)?.color || "#ea580c";
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={
            innerRadius ? (isActive ? innerRadius - 2 : innerRadius) : 0
          }
          outerRadius={
            outerRadius ? (isActive ? outerRadius + 4 : outerRadius) : 0
          }
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };
  return (
    <Card className="border border-border/80 shadow-xs h-[450px] animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Category Shares</CardTitle>
        <CardDescription>Overall breakdown by revenue values.</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px] flex items-center justify-center relative">
        {total === 0 ? (
          <div className="text-sm text-muted-foreground italic">
            No category data.
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
            initialDimension={{ width: 400, height: 300 }}
          >
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                shape={renderActiveShape}
                onMouseEnter={(_, idx) => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(undefined)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload as CategoryShare;
                    const percent =
                      total > 0 ? Math.round((point.value / total) * 100) : 0;
                    return (
                      <div className="bg-white dark:bg-slate-900 border border-border p-2.5 rounded-lg shadow-sm text-xs">
                        <p
                          className="font-semibold"
                          style={{ color: point.color }}
                        >
                          {point.name}
                        </p>
                        <p className="font-medium mt-0.5">
                          {formatCurrency(point.value)} ({percent}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
      {/* Dynamic legend listing categories */}
      <div className="px-6 pb-6 overflow-y-auto max-h-[110px] space-y-1.5">
        {data.map((item, idx) => (
          <div
            key={item.name}
            className={`flex items-center justify-between text-xs transition-opacity duration-200 ${
              activeIndex !== undefined && activeIndex !== idx
                ? "opacity-40"
                : "opacity-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium truncate max-w-[110px]">
                {item.name}
              </span>
            </div>
            <span className="text-muted-foreground">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
