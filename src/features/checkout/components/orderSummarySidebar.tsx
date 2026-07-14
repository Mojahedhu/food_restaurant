"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface OrderSummarySidebarProps {
  subTotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  onPlaceOrder: () => void;
  disabled: boolean;
  paymentMethod: "online" | "cod";
}

export const OrderSummarySidebar = ({
  subTotal,
  tax,
  deliveryFee,
  total,
  onPlaceOrder,
  disabled,
  paymentMethod,
}: OrderSummarySidebarProps) => {
  return (
    <Card className="drop-shadow-lg sticky top-24">
      <CardHeader className="grid-rows-[auto_auto]">
        <CardTitle className="leading-none font-semibold flex items-center gap-2">
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${subTotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="font-medium">${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax (10%)</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">Total</span>
          <span className="text-2xl font-bold text-primary">
            ${total.toFixed(2)}
          </span>
        </div>
        <Separator />
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>• Estimated delivery: 30-45 minutes</p>
          <p>
            • Payment method:{" "}
            {paymentMethod === "online"
              ? "Online (Stripe)"
              : "Cash on Delivery"}
          </p>
          <p>• All prices include applicable taxes</p>
        </div>
        <Button
          disabled={disabled}
          className="font-bold rounded-full relative overflow-hidden group/button uppercase tracking-wide transition-all duration-300 h-fit py-4! px-12! text-lg! border border-primary bg-primary text-primary-foreground hover:border-primary w-full disabled:opacity-50 cursor-pointer"
          onClick={onPlaceOrder}
        >
          <span className="absolute inset-0 transition-transform duration-300 ease-out bg-primary-foreground -translate-x-full group-hover/button:translate-x-0"></span>
          <span className="relative z-10 transition-colors duration-300 flex items-center gap-2 group-hover/button:text-primary">
            <CheckCircle className="h-5 w-5 mr-2" />
            Place Order
          </span>
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          By placing this order, you agree to our terms and conditions
        </p>
      </CardContent>
    </Card>
  );
};
