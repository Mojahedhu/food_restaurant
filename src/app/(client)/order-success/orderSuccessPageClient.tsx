"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "../../../../types/sanityTypes";
import {
  ArrowRight,
  CircleCheckBig,
  Clock,
  CreditCard,
  Home,
  MapPin,
  Package,
  Receipt,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface OrderSuccessPageClientProps {
  order: Order;
}

const OrderSuccessPageClient = ({ order }: OrderSuccessPageClientProps) => {
  const router = useRouter();
  console.log(order);

  return (
    <div className="bg-linear-to-b from-primary/5 to-background min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="bg-primary/5 border border-primary/50 shadow-xl">
            <CardContent className="px-6 pt-8 pb-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                  <CircleCheckBig className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Order Placed Successfully!
                  </h1>
                  <p className="text-muted-foreground">
                    Thank you for your order. We&apos;ve received it and will
                    start preparing it shortly.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Order Number:{" "}
                    <span className="font-semibold text-foreground">
                      {order.orderNumber}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-xl">
            <CardHeader className="grid-rows-[auto_auto]">
              <CardTitle className="font-semibold leading none flex items-center gap-2 ">
                <Package className="h-5 w-5 text-primary" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Current Status
                  </p>
                  <Badge
                    variant={"destructive"}
                    className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30"
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">
                    Payment Method
                  </p>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="font-medium text-[16px]">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">Estimated Delivery Time</p>
                  <p className="text-sm text-muted-foreground">30-45 minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-xl">
            <CardHeader className="grid-rows-[auto_auto]">
              <CardTitle className="leading-none font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <p className="font-semibold">{order.deliveryAddress?.label}</p>
                <p className="text-sm">
                  {order.deliveryAddress?.country} ,{" "}
                  {order.deliveryAddress?.zipCode}
                </p>
                <p className="text-sm">
                  {order.deliveryAddress?.state} , {order.deliveryAddress?.city}{" "}
                  {order.deliveryAddress?.street}
                </p>
                <p className="text-sm text-muted-foreground">
                  Phone: +249129604336
                </p>
                <p className="text-xs text-muted-foreground pt-2 border-t">
                  Instructions: My favorite
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-xl">
            <CardHeader className="grid-rows-[auto_auto]">
              <CardTitle className="leading-none font-semibold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 space-y-4">
              <div className="space-y-3">
                {order.items &&
                  order.items.map((item, index) => (
                    <div
                      key={typeof item._key === "string" ? item._key : `item-${index}`}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-[16px]">{item.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          $ {item.price?.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-[16px]">
                    $ {order.subtotal?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium text-[16px]">
                    $ {order.deliveryFee?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium text-[16px]">
                    $ {order.tax?.toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    $ {order?.total?.toFixed(2)}
                  </span>
                </div>
              </div>
              <Separator />
            </CardContent>
          </Card>
          <div className="space-y-3 pt-4">
            <Button
              size={"lg"}
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group rounded-lg cursor-pointer"
              onClick={() => router.push(`user/orders/${order._id}`)}
            >
              <Truck className="mr-3 h-5 w-5 group-hover:scale-110 use-effect" />
              Track Your Order
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 use-effect" />
            </Button>
            <Button
              size={"lg"}
              variant={"outline"}
              className="w-full h-12 font-medium border-2 bg-muted/30 hover:bg-muted/80 transition-all duration-300 group cursor-pointer"
              onClick={() => router.push("user/orders")}
            >
              <Package className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              View All Orders
            </Button>
            <Button
              size={"lg"}
              variant={"outline"}
              className="w-full h-12 font-medium border-2 bg-muted/30 hover:bg-muted/80 transition-all duration-300 group cursor-pointer"
              onClick={() => router.push("user/orders")}
            >
              <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Back to Home
            </Button>
          </div>
          <Card className="bg-muted/50">
            <CardContent className="px-6 pt-6">
              <p className="text-sm text-center text-muted-foreground">
                You will receive updates about your order via email. For any
                questions, please contact our support team.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPageClient;
