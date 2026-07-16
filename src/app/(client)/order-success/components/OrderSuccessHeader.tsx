import { Card, CardContent } from "@/components/ui/card";
import { CircleCheckBig, Receipt } from "lucide-react";

interface OrderSuccessHeaderProps {
  orderNumber: string;
}

const OrderSuccessHeader = ({ orderNumber }: OrderSuccessHeaderProps) => {
  return (
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
              Thank you for your order. We&apos;ve received it and will start
              preparing it shortly.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Order Number:{" "}
              <span className="font-semibold text-foreground">
                {orderNumber}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSuccessHeader;
