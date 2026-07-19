import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { cn, dateFormatterDeep } from "@/lib/utils";
import { OrderSummary } from "@/../types/sanityTypes";

interface OrderMobileListProps {
  orders: OrderSummary[];
}

export default function OrderMobileList({ orders }: OrderMobileListProps) {
  return (
    <div className="md:hidden divide-y">
      {orders.map((order) => {
        const formatted = dateFormatterDeep(order._createdAt);
        return (
          <div key={order._id} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">#{order.orderNumber}</div>
                <div className="text-xs text-muted-foreground">
                  {formatted[0]}, {formatted[1]} • {formatted[2]}
                </div>
              </div>
              <Badge
                className="border-(--status-color) text-(--status-color) bg-(--status-color)/15"
                style={
                  {
                    "--status-color": order.status?.color || "currentColor",
                  } as React.CSSProperties
                }
              >
                {order.status?.title}
              </Badge>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">
                {order.items?.length === 1 ? "Item: " : "Items: "}
              </span>
              <span className="font-medium">{order.items?.length}</span>
              <div className="text-xs text-muted-foreground mt-1">
                {order.items?.map((item, index: number) => (
                  <span key={item.foodId}>
                    {item.name}
                    {index < order.items!.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs text-muted-foreground">Payment</div>
                <div className="text-sm capitalize">
                  {order.paymentMethod === "cod" ? "COD" : order.paymentMethod}
                </div>
                <Badge
                  className={cn(
                    order.paymentStatus === "paid" &&
                      "bg-primary text-primary-foreground",
                    order.paymentStatus === "pending" && "bg-yellow-500",
                    order.paymentStatus === "failed" &&
                      "bg-destructive text-destructive-foreground",
                  )}
                >
                  {order.paymentStatus}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="text-lg font-bold text-primary">
                  ${(order.total || 0).toFixed(2)}
                </div>
              </div>
            </div>
            <Link
              className="inline-flex items-center justify-center font-bold rounded-full relative overflow-hidden group/button uppercase tracking-wide transition-all duration-300 py-2 px-6 text-sm border border-primary/70 text-primary bg-transparent hover:border-primary w-full"
              href={`/user/orders/${order._id}`}
            >
              <span className="absolute inset-0 transition-transform duration-300 ease-out bg-primary -translate-x-full group-hover/button:translate-x-0"></span>
              <span className="relative z-10 transition-colors duration-300 flex items-center gap-2 group-hover/button:text-primary-foreground">
                <Eye className="h-4 w-4 mr-2" /> View Details
              </span>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
