import { client } from "@/sanity/lib/client";
import { NextResponse } from "next/server";

export async function GET() {
  const statuses = [
    {
      _id: "status-placed", // Fixed ID for consistency
      _type: "orderStatus",
      title: "Order Placed",
      value: { _type: "slug", current: "order-placed" },
      description:
        "Your order has been received and is waiting for confirmation.",
      color: "#3B82F6", // Blue
      order: 1,
      isDefault: true,
      isActive: true,
    },
    {
      _id: "status-confirmed",
      _type: "orderStatus",
      title: "Confirmed",
      value: { _type: "slug", current: "confirmed" },
      description: "The restaurant has accepted your order.",
      color: "#8B5CF6", // Purple
      order: 2,
      isDefault: false,
      isActive: true,
    },
    {
      _id: "status-preparing",
      _type: "orderStatus",
      title: "Preparing",
      value: { _type: "slug", current: "preparing" },
      description: "Your food is being cooked.",
      color: "#F59E0B", // Amber
      order: 3,
      isDefault: false,
      isActive: true,
    },
    {
      _id: "status-out-for-delivery",
      _type: "orderStatus",
      title: "Out for Delivery",
      value: { _type: "slug", current: "out-for-delivery" },
      description: "Our rider is on the way to your location.",
      color: "#10B981", // Emerald
      order: 4,
      isDefault: false,
      isActive: true,
    },
    {
      _id: "status-delivered",
      _type: "orderStatus",
      title: "Delivered",
      value: { _type: "slug", current: "delivered" },
      description: "Order completed. Enjoy your meal!",
      color: "#059669", // Green
      order: 5,
      isDefault: false,
      isActive: true,
    },
    {
      _id: "status-cancelled", // Or "status_cancelled" to match the webhook
      _type: "orderStatus",
      title: "Cancelled",
      value: { _type: "slug", current: "cancelled" },
      description: "The order has been cancelled.",
      color: "#EF4444", // Red
      order: 6,
      isDefault: false,
      isActive: true,
    },
  ];

  try {
    const transactions = statuses.map((status) =>
      client.createOrReplace(status),
    );

    await Promise.all(transactions);

    return NextResponse.json({
      message: "Successfully seeded order statuses",
      count: statuses.length,
    });
  } catch (error) {
    console.error(error);
    const err = error as { message: string };
    return NextResponse.json({
      error: err.message || String(error),
      status: 500,
    });
  }
}
