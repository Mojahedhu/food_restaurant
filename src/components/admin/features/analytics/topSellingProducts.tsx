"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductSale } from "@/actions/admin-analytics";
import { formatCurrency } from "@/lib/utils";

interface TopSellingProductsProps {
  data: ProductSale[];
}

export function TopSellingProducts({ data }: TopSellingProductsProps) {
  const maxSales = data.length > 0 ? Math.max(...data.map((d) => d.sales)) : 1;

  return (
    <Card className="border border-border/80 shadow-xs h-[420px] animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="text-lg font-bold">
          Top Performing Products
        </CardTitle>
        <CardDescription>
          Best-selling dishes ranked by order quantities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {data.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground italic">
            No product sales logged.
          </div>
        ) : (
          data.map((prod, idx) => {
            const percentage = Math.round((prod.sales / maxSales) * 100);
            return (
              <div key={prod.name} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-400">
                      #{idx + 1}
                    </span>
                    <span className="font-medium truncate max-w-[180px] sm:max-w-xs">
                      {prod.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{prod.sales} sold</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(prod.revenue)}
                    </span>
                  </div>
                </div>
                {/* Horizontal progress bar representing comparative sales */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
