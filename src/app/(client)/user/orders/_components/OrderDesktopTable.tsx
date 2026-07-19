import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { cn, dateFormatterDeep } from "@/lib/utils";
import { OrderSummary } from "@/../types/sanityTypes";

interface OrderDesktopTableProps {
  orders: OrderSummary[];
}

export default function OrderDesktopTable({ orders }: OrderDesktopTableProps) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr className="border-b">
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Order
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Items
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Payment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {orders.map((order) => {
            const formatted = dateFormatterDeep(order._createdAt);
            return (
              <tr
                key={order._id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-[16px]">
                    #{order.orderNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    {formatted[0] + ", " + formatted[1]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatted[2]}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    {order.items?.length}{" "}
                    {order.items?.length === 1 ? "item" : "items"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {order.items?.map((item, index: number) => (
                      <span key={item.foodId}>
                        {item.name}
                        {index < order.items!.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-semibold text-primary text-[16px]">
                    ${(order.total || 0).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm capitalize">
                    {order.paymentMethod === "cod"
                      ? "COD"
                      : order.paymentMethod}
                  </div>
                  <Badge
                    className={cn(
                      "capitalize",
                      order.paymentStatus === "paid" && "bg-primary",
                      order.paymentStatus === "pending" && "bg-yellow-500",
                      order.paymentStatus === "failed" && "bg-destructive",
                    )}
                  >
                    {order.paymentStatus}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
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
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <Link
                    className="inline-flex items-center justify-center font-bold rounded-full relative overflow-hidden group/button uppercase tracking-wide transition-all duration-300 py-2 px-6 text-sm border border-primary/70 text-primary bg-transparent hover:border-primary"
                    href={`/user/orders/${order._id}`}
                  >
                    <span className="absolute inset-0 transition-transform duration-300 ease-out bg-primary -translate-x-full group-hover/button:translate-x-0"></span>
                    <span className="relative z-10 transition-colors duration-300 flex items-center gap-2 group-hover/button:text-primary-foreground">
                      <Eye className="h-4 w-4 mr-1" /> View
                    </span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
