import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, ShoppingBag, Users, Percent } from "lucide-react";
import { DashboardStats } from "@/types/admin";

interface DashboardMetricCardsProps {
  stats: DashboardStats;
}

export function DashboardMetricCards({ stats }: DashboardMetricCardsProps) {
  const items = [
    {
      title: "Total Sales",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color:
        "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400",
      description: "Direct revenue from paid checkout orders.",
    },
    {
      title: "Order Volumes",
      value: stats.ordersCount.toLocaleString(),
      icon: ShoppingBag,
      color: "text-primary bg-primary/10",
      description: "Aggregate transaction orders.",
    },
    {
      title: "Active Users",
      value: stats.usersCount.toLocaleString(),
      icon: Users,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400",
      description: "Registered consumer accounts.",
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(stats.aov),
      icon: Percent,
      color:
        "text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400",
      description: "Mean checkout basket valuation.",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card
            key={idx}
            className="overflow-hidden border border-border shadow-xs hover:shadow-md hover:-translate-y-1 transition-all ease-out transform animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${idx * 75}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </p>
                  <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                    {item.value}
                  </p>
                </div>
                <div
                  className={`size-12 rounded-xl flex items-center justify-center ${item.color} shrink-0`}
                >
                  <Icon className="size-6" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {item.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
