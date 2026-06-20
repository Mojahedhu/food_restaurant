import { Suspense } from "react";
import { fetchAdminOrdersPaged } from "@/actions/admin-orders";
import OrdersTableSkeleton from "./_components/ordersTableSkeleton";
import { OrdersTable } from "@/components/admin/features/orders/ordersTable";
import { PaginationControls } from "@/components/admin/features/orders/paginationControls";
import { OrdersFilterBar } from "@/components/admin/features/orders/ordersFilterBar";
// import { OrdersTable } from "@/components/admin/features/orders/OrdersTable";

export const metadata = {
  title: "Admin | Orders Management",
  description: "Manage and update customer orders.",
};

interface AdminOrdersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    orderStatus?: string;
    paymentStatus?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const resolvedParams = await searchParams;

  const currentPage = Number(resolvedParams.page || "1");
  const search = resolvedParams.search || "";
  const orderStatus = resolvedParams.orderStatus || "";
  const paymentStatus = resolvedParams.paymentStatus || "";
  const sortBy = resolvedParams.sortBy || "date";
  const sortOrder = resolvedParams.sortOrder || "desc";

  const pageSize = 10;

  const { totalItems, orders } = await fetchAdminOrdersPaged({
    page: currentPage,
    pageSize,
    search,
    orderStatus,
    paymentStatus,
    sortBy,
    sortOrder,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your recent orders, update statuses, and view details.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <OrdersFilterBar />

      {/* Table & Pagination */}
      <div className="bg-white dark:bg-card rounded-xl border shadow-sm overflow-hidden">
        <Suspense fallback={<OrdersTableSkeleton />}>
          <div className="p-8 text-center text-muted-foreground">
            Successfully fetched {orders.length} orders from Sanity!
            <br />
            <div className="bg-white dark:bg-card rounded-xl border shadow-sm overflow-hidden">
              <Suspense fallback={<OrdersTableSkeleton />}>
                {/* We now pass the exact fetched orders to our Client Table */}
                <OrdersTable initialOrders={orders} />
                <PaginationControls
                  totalItems={totalItems}
                  currentPage={currentPage}
                  pageSize={pageSize}
                />
              </Suspense>
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
