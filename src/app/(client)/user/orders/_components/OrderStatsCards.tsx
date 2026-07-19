import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleCheckBig, Clock, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrderStatsCards({
  stats,
}: {
  stats: { total: number; inProgress: number; completed: number };
}) {
  const cardItems = [
    {
      label: "Total Orders",
      value: stats.total,
      Icon: ShoppingBag,
      footerLabel: "All time",
      highlight: false,
    },
    {
      label: "InProgress",
      value: stats.inProgress,
      Icon: Clock,
      footerLabel: "Active Orders",
      highlight: true,
    },
    {
      label: "Completed",
      value: stats.completed,
      Icon: CircleCheckBig,
      footerLabel: "Delivered orders",
      highlight: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cardItems.map((item) => (
        <Card key={item.label} className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
            <item.Icon
              className={cn(
                "h-4 w-4",
                item.highlight ? "text-primary" : "text-muted-foreground",
              )}
            />
          </CardHeader>
          <CardContent className="px-6">
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.footerLabel}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
