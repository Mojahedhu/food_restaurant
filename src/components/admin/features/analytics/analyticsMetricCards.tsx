"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import { AnalyticsKPIs } from "@/lib/services/admin.analytics.service";

interface AnalyticsMetricCardsProps {
  kpis: AnalyticsKPIs;
}

export function AnalyticsMetricCards({ kpis }: AnalyticsMetricCardsProps) {
  const cards = [
    {
      title: "Total Net Revenue",
      value: formatCurrency(kpis.totalRevenue),
      desc: "All settled orders",
      icon: DollarSign,
      color: "text-orange-600 bg-orange-50 dark:bg-orange-950/20",
      progress: 80,
    },
    {
      title: "Gross Orders",
      value: kpis.totalOrders,
      desc: "Total transaction counts",
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20",
      progress: 65,
    },
    {
      title: "Average Order Value",
      value: formatCurrency(kpis.aov),
      desc: "Avg spend per ticket",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20",
      progress: 72,
    },
    {
      title: "Fulfillment Rate",
      value: `${kpis.completionRate}%`,
      desc: "Completed delivery share",
      icon: CheckCircle2,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/20",
      progress: kpis.completionRate,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <Card
          key={card.title}
          className="border border-border/80 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-2"
          style={{ animationDelay: `${idx * 75}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl ${card.color}`}>
                <card.icon className="size-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold tracking-tight">
                {card.value}
              </span>
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </div>
            {/* Animated progress indicator bar */}
            <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${card.progress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
