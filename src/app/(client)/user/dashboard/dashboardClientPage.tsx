"use client";
import { useState } from "react";
import { Order, User } from "@/../types/sanityTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Clock,
  MapPin,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getElapsedTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAddressStore } from "@/features/address/store/addressStore";
import { useLiveAddress } from "@/hooks/useLiveAddress";
import { DashboardCardDetails } from "./_components/dashboardCardDetails";

interface DashboardClientPageProps {
  userId: string;
  initialOrders: Order[];
  isAdmin?: boolean;
  user: User;
}

const activeOrder = (orders: Order[]) => {
  return orders.filter((order) => order.paymentStatus !== "paid");
};

const quickActionsList = [
  {
    title: "Browse Menu",
    icon: <ShoppingBag className="h-6 w-6 text-primary" />,
    href: "/menu",
  },
  {
    title: "View Orders",
    icon: <Package className="h-6 w-6 text-primary" />,
    href: "orders",
  },
  {
    title: "Manage Addresses",
    icon: <MapPin className="h-6 w-6 text-primary" />,
    href: "addresses",
  },
  {
    title: "Account Settings",
    icon: <TrendingUp className="h-6 w-6 text-primary" />,
    href: "profile",
  },
];
const DashboardClientPage = ({
  userId,
  user,
  initialOrders,
  isAdmin,
}: DashboardClientPageProps) => {
  // Safe state mapping
  const [orders] = useState<Order[]>(initialOrders);

  const { addresses } = useAddressStore();
  const defaultAddress = addresses.filter((addr) => addr.isDefault === true)[0];
  const hydrated = useAddressStore((state) => state.ui.initializing);

  // Real-time synchronization hooks
  useLiveAddress(userId);

  // Derived state analytics

  const completedOrders = orders.filter(
    (order) => order.paymentStatus === "paid",
  );
  const recentOrders = orders.slice(0, 5);

  const cardData = [
    {
      title: "Total Orders",
      value: orders.length,
      description: "All time orders",
      Icon: <ShoppingBag className="h-4 w-4 text-primary" />,
      iconStyle: "bg-primary/10",
    },
    {
      title: "Active",
      value: activeOrder(orders).length,
      description: "In progress",
      iconStyle: "bg-orange-500/10",
      Icon: <Clock className="h-4 w-4 text-orange-500" />,
    },
    {
      title: "Completed",
      value: completedOrders.length,
      description: "Delivered orders",
      iconStyle: "bg-primary/10",
      Icon: <Package className="h-4 w-4 text-primary" />,
    },
    {
      title: "Total Spent",
      value:
        "$" + completedOrders.reduce((total, order) => total + order.total!, 0),
      description: "Lifetime spending",
      iconStyle: "bg-blue-500/10",
      Icon: <TrendingUp className="h-4 w-4 text-blue-500" />,
    },
  ];
  return (
    <main className="w-full">
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s an overview of your{" "}
              {isAdmin ? "restaurants" : "account"} activity
            </p>
          </div>
        </div>

        {/* Analytics KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cardData.map((card) => (
            <DashboardCardDetails
              key={card.title}
              title={card.title}
              value={card.value}
              description={card.description}
              Icon={() => card.Icon}
              iconStyle={card.iconStyle}
            />
          ))}
        </div>

        {/* Dashboard Panels */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Orders Panel */}
          <Card className="shadow-md border border/60 flex flex-col">
            <CardHeader className="flex! flex-row items-center justify-between space-y-0 pb-2 border-b">
              <CardTitle className="leading-none font-semibold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Recent Orders
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 hover:bg-primary/10 hover:text-primary"
              >
                <Link href="orders">View All</Link>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              {recentOrders.length > 0 ? (
                <div className="divide-y">
                  {recentOrders.map((order) => (
                    <Link
                      key={order._id}
                      href={`/user/orders/${order._id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                        <div className="space-y-1">
                          <p className="text-sm font-medium flex items-center gap-2">
                            Order #{order.orderNumber?.slice(-6) || "N/A"}
                            {order.paymentStatus === "paid" ? (
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-4 px-1.5 bg-emerald-500/15 text-emerald-700"
                              >
                                Paid
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-4 px-1.5 text-orange-600 border-orange-200"
                              >
                                Pending
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {getElapsedTime(order?._createdAt)} •{" "}
                            {order?.items?.length || 0}{" "}
                            {order?.items?.length === 1 ? "item" : "items"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">
                            ${(order.total || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold">No recent orders</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    When you place an order, it will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration Panel */}

          <div className="space-y-6 flex flex-col">
            {/* Quick Actions */}
            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="leading-none font-semibold">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid gap-3 grid-cols-2">
                {quickActionsList.map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="h-auto flex-col items-center justify-center gap-2 py-4 shadow-none hover:bg-muted/50 border-border/60 hover:border-primary/50 transition-all group"
                    asChild
                  >
                    <Link href={action.href}>
                      <span
                        className={`group-hover:scale-110 transition-transform duration-300`}
                      >
                        {action.icon}
                      </span>
                      <span className="text-xs font-semibold">
                        {action.title}
                      </span>
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
            {/* Saved Addresses */}
            <Card className="shadow-sm border-border/60 flex-1">
              <CardHeader className="flex! flex-row items-center justify-between space-y-0 pb-3 border-b">
                <CardTitle className="leading-none font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Primary Address
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 hover:bg-primary/10 hover:text-primary"
                  asChild
                >
                  <Link href="addresses">Manage</Link>
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                {hydrated ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-5 w-24 rounded-md bg-muted"></div>
                    <div className="h-4 w-48 rounded-md bg-muted/60"></div>
                  </div>
                ) : defaultAddress ? (
                  <div className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:border-primary/40 transition-colors shadow-sm">
                    <div className="mt-1 p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold">
                          {defaultAddress.label || "Home"}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-transparent"
                        >
                          Default
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {defaultAddress.label}
                        {defaultAddress.street && <br />}
                        {defaultAddress.apartment}
                        <br />
                        {defaultAddress.city}, {defaultAddress.state}{" "}
                        {defaultAddress.country}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">
                      No saved addresses found.
                    </p>
                    <Button
                      variant="link"
                      className="text-primary mt-2 h-auto p-0"
                      asChild
                    >
                      <Link href="addresses">Add your first address</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardClientPage;
