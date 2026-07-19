import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Receipt, CreditCard } from "lucide-react";
import { Order, OrderSummary } from "@/../types/sanityTypes";

export default function OrderSummaryReceipt({ order }: { order: Order }) {
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="border-b bg-muted/10 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="w-5 h-5 text-primary" /> Receipt
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground font-medium">Subtotal</span>
          <span className="font-semibold">
            ${(order.subtotal || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground font-medium">
            Delivery Fee
          </span>
          <span className="font-semibold">
            ${(order.deliveryFee || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground font-medium">Tax</span>
          <span className="font-semibold">${(order.tax || 0).toFixed(2)}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between items-center">
          <span className="font-bold text-foreground">Total</span>
          <span className="font-black text-xl text-primary">
            ${(order.total || 0).toFixed(2)}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CreditCard className="w-4 h-4" /> Payment
          </div>
          <Badge
            variant={order.paymentStatus === "paid" ? "default" : "destructive"}
            className="uppercase text-[10px] tracking-wider"
          >
            {order.paymentStatus}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
