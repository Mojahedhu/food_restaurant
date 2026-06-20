"use client";
import { useLiveOrder } from "@/hooks/useLiveOrder";
import { Order } from "../../../../../../types/sanityTypes";
import Link from "next/link";
import {
  ArrowLeftIcon,
  Clock,
  Coins,
  CreditCard,
  Home,
  MapPin,
  Package,
  Receipt,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, getElapsedTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderStatus, { Status } from "@/features/orders/components/orderStatus";

import { useEffect, useState } from "react";
import { statusOrder as statusFlow } from "@/features/orders/components/orderStatus";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface OrderDetailsClientPageProps {
  orderId: string;
  initialOrder?: Order;
}
const randomDelay = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const timings = [
  [4000, 8000],
  [6000, 12000],
  [10000, 18000],
  [8000, 15000],
  [15000, 30000],
] as const;

const OrderDetailsClientPage = ({
  orderId,
  initialOrder,
}: OrderDetailsClientPageProps) => {
  const { order, loading, error } = useLiveOrder(orderId, initialOrder);
  const [status, setStatus] = useState<Status>(statusFlow[0]);
  const [eta, setEta] = useState<number>(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const run = async () => {
      let totalRemaining = 0;

      // calculate total ETA initially
      for (let i = 0; i < timings.length; i++) {
        totalRemaining += randomDelay(timings[i][0], timings[i][1]);
      }

      setEta(Math.ceil(totalRemaining / 1000));

      for (let i = 0; i < statusFlow.length - 1; i++) {
        const delay = randomDelay(timings[i][0], timings[i][1]);

        await new Promise<void>((resolve) => {
          timeoutId = setTimeout(() => resolve(), delay);
        });

        if (cancelled) return;

        setStatus(statusFlow[i + 1]);

        totalRemaining -= delay;
        setEta(Math.max(0, Math.ceil(totalRemaining / 1000)));
      }

      setRunning(false);
    };

    run();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  // live countdown every second
  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setEta((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [running]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!order) {
    return <div>Order not found</div>;
  }
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <main className="w-full">
        <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
          <div className="bg-background border-b sticky top-0 z-10 shadow-sm">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <Link
                  href={"/user/orders"}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="text-sm">Back to Orders</span>
                </Link>
                <div className="flex items-center gap-3">
                  <Receipt className="h-5 w-5 text-primary" />
                  <div>
                    <h1 className="text-xl font-bold">
                      Order #{order.orderNumber}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      {getElapsedTime(order._createdAt!)}
                    </p>
                  </div>
                </div>
                <Badge className="px-3! py-1! h-fit text-sm uppercase">
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <OrderStatus currentStatus={status} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="drop-shadow-lg hover:drop-shadow-xl transition-shadow">
                  <CardHeader className="grid-rows-[auto_auto]">
                    <CardTitle className="font-semibold flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-primary" />
                      Estimated Delivery
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6">
                    <p className="text-2xl font-bold">
                      {order.estimatedDeliveryTime}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      We&apos;ll notify you when your order is on the way
                    </p>
                  </CardContent>
                </Card>
                <Card className="drop-shadow-lg hover:drop-shadow-xl transition-shadow">
                  <CardHeader className="grid-rows-[auto_auto]">
                    <CardTitle className="font-semibold flex items-center gap-2 text-lg">
                      <Wallet className="h-5 w-5 text-primary" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6">
                    <p className="text-2xl font-semibold">
                      {order.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </p>
                    <Badge variant={"secondary"} className="mt-2 text-primary">
                      {order.paymentStatus}
                    </Badge>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="grid-rows-[auto_auto]">
                    <CardTitle className="font-semibold flex items-center gap-2 text-lg">
                      <Receipt className="h-5 w-5 text-primary" />
                      Order Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6">
                    <p className="text-3xl font-bold text-primary">
                      ${order.total}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Including tax &amp; delivery
                    </p>
                  </CardContent>
                </Card>
              </div>
              {order.paymentStatus !== "paid" && (
                <Card
                  className={cn(
                    "shadow-lg border-2 ",
                    "border-yellow-500/30 bg-yellow-500/5",
                  )}
                >
                  <CardContent className="px-6 pt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3
                          className={cn(
                            "text-lg font-semibold",

                            " text-yellow-700 dark:text-yellow-400",
                          )}
                        >
                          Payment{" "}
                          {(order.paymentStatus?.slice(0, 1)?.toUpperCase() ||
                            "") + order.paymentStatus?.slice(1)}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Complete your payment to confirm your order
                        </p>
                      </div>
                      <button
                        type="button"
                        className={cn(
                          "inline-flex items-center justify-center font-bold rounded-full relative overflow-hidden group/button uppercase tracking-wide transition-all duration-300 py-4 px-12 text-lg border text-white hover:border-primary bg-yellow-600 hover:bg-yellow-700 border-yellow-600",
                        )}
                      >
                        <span className="absolute inset-0 transition-transform duration-300 ease-out bg-primary-foreground translate-x-full group-hover/button:translate-x-0"></span>
                        <span className="relative z-10 transition-colors duration-300 flex items-center gap-2 group-hover/button:text-primary">
                          <CreditCard className="mr-2 h-5 w-5" />
                          Pay Now - ${order.total}
                        </span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg">
                  <CardHeader className="grid-rows-[auto_auto]">
                    <CardTitle className="leading-none font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6">
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                      <p className="font-semibold">
                        {order.deliveryAddress?.label}
                      </p>
                      <p className="text-sm">
                        {order.deliveryAddress?.country},{" "}
                        {order.deliveryAddress?.zipCode}
                      </p>
                      <p className="text-sm">
                        {order.deliveryAddress?.country},{" "}
                        {order.deliveryAddress?.city}{" "}
                        {order.deliveryAddress?.street}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Phone: {order.deliveryAddress?.phone}
                      </p>
                      <p className="text-xs text-muted-foreground pt-2 border-t">
                        {order.deliveryAddress?.instructions}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-lg">
                  <CardHeader className="grid-rows-[auto_auto]">
                    <CardTitle className="leading-none font-semibold flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Order Items ({order.items?.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 space-y-4">
                    {order.items?.map((item, index) => {
                      console.log(item._key);
                      return (
                        <div
                          key={
                            typeof item._key === "string"
                              ? item._key
                              : `item-${index}`
                          }
                          className="space-y-3 max-h-100 overflow-y-auto"
                        >
                          <div className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors border-b last:border-0">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${item.price}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
              <Card className="shadow-lg">
                <CardHeader className="grid-rows-[auto_auto]">
                  <CardTitle className="leading-none font-semibold flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    Price Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-base">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        ${order.subtotal?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-muted-foreground">
                        Delivery Fee
                      </span>
                      <span className="font-medium">
                        ${order.deliveryFee?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">
                        ${order.tax?.toFixed(2)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        ${order.total?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={"/"} className="flex-1">
                  <Button variant={"outline"} className="w-full py-2.5 h-fit">
                    <Home className="mr-2 h-5 w-5" />
                    Back to Home
                  </Button>
                </Link>
                <Link href={"/user/orders"} className="flex-1">
                  <Button className="w-full py-2.5 h-fit">
                    <Package className="mr-2 h-5 w-5" />
                    View All Orders
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetailsClientPage;
