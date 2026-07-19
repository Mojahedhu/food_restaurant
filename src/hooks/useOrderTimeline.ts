import { Order, OrderSummary } from "@/../types/sanityTypes";

export function useOrderTimeline(
  order: Order,
  allStatuses: OrderSummary["status"][],
) {
  const currentStatus = order.status || allStatuses[0];
  const maxOrder = allStatuses[allStatuses.length - 1]?.order || 1;
  const currentProgress = currentStatus
    ? ((currentStatus?.order || 0) / maxOrder) * 100
    : 0;
  return { currentStatus, currentProgress };
}
