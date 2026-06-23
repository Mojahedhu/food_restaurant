// src/app/admin/products/page.tsx
import { Suspense } from "react";
import {
  fetchAdminProductsPaged,
  fetchAllCategories,
} from "@/actions/admin-products";
import { ProductsTable } from "@/components/admin/features/products/productsTable";
import { ProductsFilterBar } from "@/components/admin/features/products/productsFilterBar";
import { PaginationControls } from "@/components/admin/features/orders/paginationControls";
import ProductsTableSkeleton from "./_components/productsTableSkeleton";

export const metadata = {
  title: "Admin | Products Management",
  description: "Manage your food items and menu catalog.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    available?: string;
  }>;
}

export default async function AdminProductsPage({
  searchParams,
}: ProductsPageProps) {
  const resolvedParams = await searchParams;

  // 1. Resolve and parse parameters with fallbacks
  const currentPage = Number(resolvedParams.page || "1");
  const search = resolvedParams.search || "";
  const category = resolvedParams.category || "";
  const available = resolvedParams.available || "";

  const pageSize = 10;

  // 2. Fetch page products and dynamic categories in parallel on the server
  const [{ totalItems, products }, categories] = await Promise.all([
    fetchAdminProductsPaged({
      page: currentPage,
      pageSize,
      search,
      category,
      available,
    }),
    fetchAllCategories(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Metadata Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-55">
            Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your food items, toggle availability, edit prices, or create
            new menu options ({totalItems} items).
          </p>
        </div>
      </div>

      {/* Filter Bar with Category Seeding Creator */}
      <ProductsFilterBar categories={categories} />

      {/* Main Data Table & Pagination Controls */}
      <div className="bg-white dark:bg-card rounded-xl border border-border shadow-sm overflow-hidden p-6">
        <Suspense fallback={<ProductsTableSkeleton />}>
          <ProductsTable initialProducts={products} categories={categories} />

          <PaginationControls
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
          />
        </Suspense>
      </div>
    </div>
  );
}
