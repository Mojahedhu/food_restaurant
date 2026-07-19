import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone } from "lucide-react";
import { Order, OrderSummary } from "@/../types/sanityTypes";

export default function OrderDeliveryInfo({ order }: { order: Order }) {
  if (!order.deliveryAddress) return null;

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="border-b bg-muted/10 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5 text-primary" /> Delivery Info
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div>
          <p className="text-sm font-bold mb-1">
            {order.userName || "Customer"}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            {order.deliveryAddress.street}{" "}
            {order.deliveryAddress.apartment &&
              `, ${order.deliveryAddress.apartment}`}
            <br />
            {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
            {order.deliveryAddress.zipCode}
          </p>
        </div>
        {order.deliveryAddress.phone && (
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Phone className="w-3.5 h-3.5" /> {order.deliveryAddress.phone}
          </div>
        )}
        {order.deliveryAddress.instructions && (
          <div className="p-3 bg-muted/50 rounded-lg border border-border/50 text-xs text-muted-foreground italic">
            &ldquo;{order.deliveryAddress.instructions}&rdquo;
          </div>
        )}
      </CardContent>
    </Card>
  );
}
