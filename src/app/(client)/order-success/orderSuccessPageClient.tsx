"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Order } from "@/../types/sanityTypes";
import OrderSuccessHeader from "./components/OrderSuccessHeader";
import OrderStatusCard from "./components/OrderStatusCard";
import OrderDeliveryAddress from "./components/OrderDeliveryAddress";
import OrderSummaryCard from "./components/OrderSummaryCard";
import OrderActions from "./components/OrderActions";
import { useOrderSuccessAccess } from "./hooks/useOrderSuccessAccess";

interface OrderSuccessPageClientProps {
  order: Order;
}

const OrderSuccessPageClient = ({ order }: OrderSuccessPageClientProps) => {
  const { isBlocked, handleNavigateAway } = useOrderSuccessAccess(order._id);

  if (!order || isBlocked) return null;

  return (
    <div className="bg-linear-to-b from-primary/5 to-background min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <OrderSuccessHeader orderNumber={order.orderNumber || "N/A"} />

          <OrderStatusCard
            paymentStatus={order.paymentStatus || "PENDING"}
            paymentMethod={order.paymentMethod || "N/A"}
          />

          <OrderDeliveryAddress address={order.deliveryAddress} />

          <OrderSummaryCard order={order} />

          <OrderActions orderId={order._id} onNavigate={handleNavigateAway} />
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
