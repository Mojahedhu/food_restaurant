import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Order, OrderSummary } from "@/../types/sanityTypes";

export default function OrderDetailsHeader({
  order,
  currentStatus,
}: {
  order: Order;
  currentStatus: OrderSummary["status"];
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <Link
          href="/user/orders"
          className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1.5 mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          Order #{order.orderNumber?.slice(-6) || "N/A"}
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Placed on {new Date(order._createdAt).toLocaleString()}
        </p>
      </div>
      <div className="text-left sm:text-right">
        <Badge
          variant="outline"
          className="text-sm px-3 py-1 font-bold shadow-sm border-(--status-color) text-(--status-color) bg-(--status-color)/15"
          style={
            {
              "--status-color": currentStatus?.color || "currentColor",
            } as React.CSSProperties
          }
        >
          {currentStatus?.title || "Processing"}
        </Badge>
      </div>
    </div>
  );
}
