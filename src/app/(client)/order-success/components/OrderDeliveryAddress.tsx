import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Order } from "@/../sanity.types";

interface OrderDeliveryAddressProps {
  address: Order["deliveryAddress"];
}

const OrderDeliveryAddress = ({ address }: OrderDeliveryAddressProps) => {
  if (!address) return null;

  return (
    <Card className="shadow-xl">
      <CardHeader className="grid-rows-[auto_auto]">
        <CardTitle className="leading-none font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Delivery Address
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <p className="font-semibold">{address.label || "Home"}</p>
          <p className="text-sm">
            {address.country} , {address.zipCode}
          </p>
          <p className="text-sm">
            {address.state} , {address.city} {address.street}
          </p>
          <p className="text-sm text-muted-foreground">
            Phone: {address.phone || "N/A"}
          </p>
          {address.instructions && (
            <p className="text-xs text-muted-foreground pt-2 border-t mt-2">
              Instructions: {address.instructions}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderDeliveryAddress;
