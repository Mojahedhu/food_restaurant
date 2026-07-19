"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package } from "lucide-react";
import { OrderSummary } from "@/../types/sanityTypes";
import { useOrdersFilters } from "@/hooks/useOrdersFilters";
import OrderStatsCards from "./_components/OrderStatsCards";
import OrderFilters from "./_components/OrderFilters";
import OrderDesktopTable from "./_components/OrderDesktopTable";
import OrderMobileList from "./_components/OrderMobileList";
import { PaginationControls } from "@/components/admin/features/orders/paginationControls";
interface UserOrdersClientPageProps {
  orders: OrderSummary[];
  totalItems: number;
  stats: { total: number; inProgress: number; completed: number };
  isAdmin: boolean;
  page: number;
  pageSize: number;
  search: string;
  statusFilter: string;
  allStatuses: OrderSummary["status"][];
}

const OrdersClientPage = (props: UserOrdersClientPageProps) => {
  const {
    orders,
    totalItems,
    stats,
    isAdmin,
    page,
    pageSize,
    search,
    statusFilter,
    allStatuses,
  } = props;

  // Clean presentation: All logic handled by the custom hook
  const { localSearch, setLocalSearch, isPending, updateUrlParams } =
    useOrdersFilters(search);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <main className="w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? "All Restaurant Orders" : "My Orders"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? "Track and manage all restaurant orders"
              : "Track and manage your order history"}
          </p>
        </div>

        {/* Stats Cards */}
        <OrderStatsCards stats={stats} />
        <OrderFilters
          localSearch={localSearch}
          setLocalSearch={setLocalSearch}
          isPending={isPending}
          statusFilter={statusFilter}
          allStatuses={allStatuses}
          updateUrlParams={updateUrlParams}
        />
        <Card className="gap-6! overflow-hidden relative">
          {isPending && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          <CardHeader>
            <CardTitle className="leading-none font-semibold">
              Order History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold">No orders found</h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Try adjusting your filters or search term.
                </p>
              </div>
            ) : (
              <>
                <OrderDesktopTable orders={orders} />
                <OrderMobileList orders={orders} />
              </>
            )}
          </CardContent>
        </Card>
        <PaginationControls
          totalItems={totalItems}
          currentPage={page}
          pageSize={pageSize}
        />
      </main>
    </div>
  );
};

export default OrdersClientPage;
