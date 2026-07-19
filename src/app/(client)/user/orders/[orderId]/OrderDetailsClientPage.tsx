"use client";
import { Order, OrderSummary } from "@/../types/sanityTypes";

import OrderDetailsHeader from "./_components/OrderDetailsHeader";
import OrderProgressTimeline from "./components/OrderProgressTimeline";
import OrderItemsList from "./components/OrderItemsList";
import OrderSummaryReceipt from "./components/OrderSummaryReceipt";
import OrderDeliveryInfo from "./components/OrderDeliveryInfo";
import { useOrderTimeline } from "@/hooks/useOrderTimeline";

interface OrderDetailsClientPageProps {
  order: Order;
  allStatuses: OrderSummary["status"][];
}

const OrderDetailsClientPage = ({
  order,
  allStatuses,
}: OrderDetailsClientPageProps) => {
  const { currentStatus, currentProgress } = useOrderTimeline(
    order,
    allStatuses!,
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <OrderDetailsHeader order={order} currentStatus={currentStatus} />
      <OrderProgressTimeline
        allStatuses={allStatuses}
        currentStatus={currentStatus}
        currentProgress={currentProgress}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <OrderItemsList items={order.items} />

        <div className="space-y-6">
          <OrderSummaryReceipt order={order} />
          <OrderDeliveryInfo order={order} />
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsClientPage;
