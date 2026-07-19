import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag } from "lucide-react";
import { Order } from "@/../types/sanityTypes";

interface OrderSummaryCardProps {
  order: Order;
}

const OrderSummaryCard = ({ order }: OrderSummaryCardProps) => {
  return (
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
                key={
                  typeof item._key === "string" ? item._key : `item-${index}`
                }
                className="flex items-center justify-between py-2"
              >
                <div className="flex-1">
                  <p className="font-medium text-[16px]">{item.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$ {item.price?.toFixed(2)}</p>
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
          <div className="flex justify-between text-lg font-bold pt-2">
            <span>Total</span>
            <span className="text-primary">$ {order.total?.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummaryCard;
