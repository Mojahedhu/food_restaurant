import auth from "@/../auth";
import { client } from "@/sanity/lib/client";
import { Order } from "@/../types/sanityTypes";
import OrdersClientPage from "./ordersClientPage";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  fetchActiveOrderStatuses,
  fetchOrderStats,
  fetchUserOrders,
} from "@/lib/services/user.orders.service";

export const metadata: Metadata = {
  title: "Order History",
  description: "View and manage all your past and active orders.",
};

interface OrdersPageProps {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userId = session.user.id;
  const isAdmin = session.user.role === "admin";
  const awaitedParams = await searchParams;
  const page = Number(awaitedParams.page) || 1;
  const pageSize = 8;
  const search = awaitedParams.search || "";
  const status = awaitedParams.status || "all";
  const [{ orders, totalItems }, stats, allStatuses] = await Promise.all([
    fetchUserOrders(userId, isAdmin, page, pageSize, search, status),
    fetchOrderStats(userId, isAdmin),
    fetchActiveOrderStatuses(),
  ]);

  return (
    <OrdersClientPage
      orders={orders}
      totalItems={totalItems}
      stats={stats}
      isAdmin={isAdmin}
      page={page}
      pageSize={pageSize}
      search={search}
      statusFilter={status}
      allStatuses={allStatuses}
    />
  );
}

export default OrdersPage;
