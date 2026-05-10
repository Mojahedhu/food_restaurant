"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLiveOrders } from "@/hooks/useLiveOrders";
import { CircleCheckBig, Clock, Eye, Loader2, ShoppingBag } from "lucide-react";
import { Order } from "../../../../../types/sanityTypes";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
interface UserOrdersClientPageProps {
  userId?: string;
  isAdmin?: boolean;
  initialOrders: Order[];
  totalOrders: number;
}

const OrdersClientPage = ({
  userId,
  isAdmin,
  initialOrders,
  totalOrders,
}: UserOrdersClientPageProps) => {
  const { orders, fetchOrders, hasMore, loading } = useLiveOrders({
    userId,
    isAdmin,
    initialOrders,
  });
  console.log(orders);
  const cardItems = [
    {
      label: "Total Orders",
      value: orders?.length ?? 0,
      Icon: ({ className }: { className?: string }) => (
        <ShoppingBag className={className} />
      ),
      footerLabel: "All time",
    },
    {
      label: "InProgress",
      value:
        orders?.filter((order) => order.status?._ref === "status-confirmed")
          ?.length ?? 0,
      Icon: ({ className }: { className?: string }) => (
        <Clock className={className} />
      ),
      footerLabel: "Active Orders",
    },
    {
      label: "Completed",
      value:
        orders?.filter((order) => order.status?._ref === "delivered")?.length ??
        0,
      Icon: ({ className }: { className?: string }) => (
        <CircleCheckBig className={className} />
      ),
      footerLabel: "Delivered orders",
    },
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <main className="w-full">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">
              {isAdmin ? "All Restaurant Orders" : "My Orders"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin
                ? "Track and manage all restaurant orders"
                : "Track and manage your order history"}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {cardItems.map((item) => (
              <Card key={item.label} className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.label}
                  </CardTitle>
                  <item.Icon
                    className={cn(
                      "h-4 w-4",
                      item.label === "Total Orders"
                        ? "text-muted-foreground"
                        : "text-primary",
                    )}
                  />
                </CardHeader>
                <CardContent className="px-6">
                  <div className="text-2xl font-bold">{item.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {item.footerLabel}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="gap-6!">
            <CardHeader>
              <CardTitle className="leading-none font-semibold">
                Order History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
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
                      const formatted = new Date(order._createdAt)
                        .toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                        .split(",");

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
                              {formatted[0] + "," + formatted[1]}
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
                              {order.items?.map((item, index) => (
                                <span key={item.foodId}>
                                  {item.name}
                                  {index < order.items!.length - 1 ? ", " : ""}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold text-primary text-[16px]">
                              ${order.total}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm capitalize">
                              {order.paymentMethod === "cod"
                                ? "COD"
                                : order.paymentMethod}
                            </div>
                            <Badge>{order.paymentStatus}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <Badge>{order.status?._ref}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <Link
                              className="inline-flex items-center justify-center font-bold rounded-full relative overflow-hidden group/button uppercase tracking-wide transition-all duration-300 py-2 px-6 text-sm border border-primary/70 text-primary bg-transparent hover:border-primary"
                              href={`/user/orders/${order._id}`}
                            >
                              <span className="absolute inset-0 transition-transform duration-300 ease-out bg-primary -translate-x-full group-hover/button:translate-x-0"></span>
                              <span className="relative z-10 transition-colors duration-300 flex items-center gap-2 group-hover/button:text-primary-foreground">
                                <Eye className=" h-4 w-4 mr-1" />
                                View
                              </span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden divide-y">
                {orders.map((order) => {
                  const formatted = new Date(order._createdAt)
                    .toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .split(",");
                  return (
                    <div key={order._id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold">
                            {order.orderNumber}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatted[0]}, {formatted[1]} • {formatted[2]}
                          </div>
                        </div>
                        <Badge>{order.status?._ref}</Badge>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          {order.items?.length === 1 ? "Item: " : "Items: "}
                        </span>
                        <span className="font-medium">
                          {order.items?.length}
                        </span>
                        <div className="text-xs text-muted-foreground mt-1">
                          {order.items?.map((item, index) => (
                            <span key={item.foodId}>
                              {item.name}
                              {index < order.items!.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-xs text-muted-foreground">
                            Payment
                          </div>
                          <div className="text-sm capitalize">
                            {order.paymentMethod === "cod"
                              ? "COD"
                              : order.paymentMethod}
                          </div>
                          <Badge>{order.paymentStatus}</Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            Total
                          </div>
                          <div className="text-lg font-bold text-primary">
                            ${order.total}
                          </div>
                        </div>
                      </div>

                      <Link
                        className="inline-flex items-center justify-center font-bold rounded-full relative overflow-hidden group/button uppercase tracking-wide transition-all duration-300 py-2 px-6 text-sm border border-primary/70 text-primary bg-transparent hover:border-primary w-full"
                        href={`/user/orders/${order._id}`}
                      >
                        <span className="absolute inset-0 transition-transform duration-300 ease-out bg-primary -translate-x-full group-hover/button:translate-x-0"></span>
                        <span className="relative z-10 transition-colors duration-300 flex items-center gap-2 group-hover/button:text-primary-foreground">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={fetchOrders}
              disabled={!hasMore || loading}
              className={cn(
                "inline-flex items-center justify-center font-bold rounded-full relative overflow-hidden group/button uppercase tracking-wide transition-all duration-300 py-4 px-12 text-lg border border-primary/70 text-primary bg-transparent hover:border-primary min-w-50 disabled:opacity-50 disabled:cursor-not-allowed",
                loading && "cursor-wait",
              )}
            >
              <span className="absolute inset-0 transition-transform duration-300 ease-out bg-primary -translate-x-full group-hover/button:translate-x-0"></span>
              <span className="relative z-10 transition-colors duration-300 flex items-center gap-2 group-hover/button:text-primary-foreground">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Orders
                    <span className="ml-2 text-xs text-muted-foreground group-hover/button:text-primary-foreground">
                      ({orders.length} of {totalOrders})
                    </span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrdersClientPage;
