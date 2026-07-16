import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, CreditCard, Package } from "lucide-react";

interface OrderStatusCardProps {
  paymentStatus: string;
  paymentMethod: string;
}

const OrderStatusCard = ({
  paymentStatus,
  paymentMethod,
}: OrderStatusCardProps) => {
  return (
    <Card className="shadow-xl">
      <CardHeader className="grid-rows-[auto_auto]">
        <CardTitle className="font-semibold leading-none flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Order Status
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Current Status</p>
            <Badge
              variant="outline"
              className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30 font-semibold"
            >
              {paymentStatus.toUpperCase()}
            </Badge>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-sm text-muted-foreground">Payment Method</p>
            <div className="flex items-center gap-1.5 justify-end">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="font-medium text-[16px] capitalize">
                {paymentMethod}
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
  );
};

export default OrderStatusCard;
