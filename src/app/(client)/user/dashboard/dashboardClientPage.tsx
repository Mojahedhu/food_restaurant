"use client";
import { useState } from "react";
import { Order, User } from "../../../../../types/sanityTypes";
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
import { useLiveAddressActions } from "@/hooks/useLiveAddressActions";
import { useAddressStore } from "@/features/address/store/addressStore";
import address from "@/sanity/schemaTypes/address";
import { useLiveAddress } from "@/hooks/useLiveAddress";

interface DashboardClientPageProps {
  userId: string;
  initialOrders: Order[];
  isAdmin?: boolean;
  user: User;
}

const activeOrder = (orders: Order[]) => {
  return orders.filter((order) => order.paymentStatus !== "paid");
};

interface CardDetailProps {
  title: string;
  value: number | string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconStyle: string;
}
const CardDetail = ({
  title,
  value,
  description,
  Icon,

  iconStyle,
}: CardDetailProps) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex! flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${iconStyle}`}>
          <Icon />
        </div>
      </CardHeader>
      <CardContent className="px-6">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const quickActionsList = [
  {
    title: "Browse Menu",
    icon: <ShoppingBag className="h-6 w-6 text-primary" />,
    href: "/menu",
  },
  {
    title: "View Order",
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
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const { addresses } = useAddressStore();
  const defaultAddress = addresses.filter((addr) => addr.isDefault === true)[0];
  const hydrated = useAddressStore((state) => state.ui.initializing);
  useLiveAddress(userId!);

  const completedOrder = orders.filter(
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
      value: completedOrder.length,
      description: "Delivered orders",
      iconStyle: "bg-primary/10",
      Icon: <Package className="h-4 w-4 text-primary" />,
    },
    {
      title: "Total Spent",
      value:
        "$" + completedOrder.reduce((total, order) => total + order.total!, 0),
      description: "Lifetime spending",
      iconStyle: "bg-blue-500/10",
      Icon: <TrendingUp className="h-4 w-4 text-blue-500" />,
    },
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <main className="w-full">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s an overview of your{" "}
              {isAdmin ? "restaurants" : "account"} activity
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cardData.map((card) => (
              <CardDetail
                key={card.title}
                title={card.title}
                value={card.value}
                description={card.description}
                Icon={() => card.Icon}
                iconStyle={card.iconStyle}
              />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-md">
              <CardHeader className="flex! flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="leading-none font-semibold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Recent Orders
                </CardTitle>
                <Button variant={"outline"} className="border-none shadow-none">
                  <Link href="orders">View All</Link>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="px-6">
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link key={order._id} href={`/user/orders/${order._id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getElapsedTime(order?._createdAt)} •{" "}
                            {order?.items?.length || 0}{" "}
                            {order?.items?.length === 1 ? "item" : "items"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary">
                              ${order.total}
                            </p>
                            <Badge>{order.paymentStatus}</Badge>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader className="flex! flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="leading-none font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Saved Addresses
                </CardTitle>
                <Button variant={"outline"} className="border-none shadow-none">
                  <Link href="addresses">Manage</Link>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="px-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    {hydrated ? (
                      <div className="animate-pulse w-full space-y-1">
                        <p className="h-5 w-5  rounded-md bg-muted"></p>
                        <p className="h-5 w-30 rounded-md bg-muted"></p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-2xl font-bold">{addresses.length}</p>
                        <p className="text-sm text-muted-foreground">
                          Total addresses
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      {Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={`items-${i}`}
                            className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center"
                          >
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-primary">
                        Default address set
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    {hydrated ? (
                      <div className="space-y-1 animate-pulse">
                        <div className="h-5 w-20 rounded-md bg-muted"></div>
                        <div className="h-5 w-50 rounded-md bg-muted"></div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {defaultAddress?.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {defaultAddress?.country || "Default Address"} -{" "}
                          {defaultAddress?.state} - {defaultAddress?.city}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge variant={"secondary"} className="text-primary">
                          Default
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="grid-rows-[auto_auto] ">
              <CardTitle className="leading-none font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickActionsList.map((action) => (
                <Link key={action.title} className="block" href={action.href}>
                  <Button
                    variant={"outline"}
                    className="w-full bg-muted-foreground/5 h-auto flex-col gap-2 py-4 hover:bg-primary/5 hover:border-primary transition-colors"
                  >
                    {action.icon}
                    {action.title}
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardClientPage;
