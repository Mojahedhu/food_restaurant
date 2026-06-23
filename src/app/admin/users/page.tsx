import { Suspense } from "react";
import { fetchAdminUsersPaged, fetchAllUserRoles } from "@/actions/admin-users";
import { UsersTable } from "@/components/admin/features/users/usersTable";
import { UsersFilterBar } from "@/components/admin/features/users/usersFilterBar";
import { PaginationControls } from "@/components/admin/features/orders/paginationControls";
import UsersTableSkeleton from "./_components/usersTableSkeleton";

export const metadata = {
  title: "Admin | Users Management",
  description:
    "Manage your registered customer accounts and role configurations.",
};

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const resolvedParams = await searchParams;

  const currentPage = Number(resolvedParams.page || "1");
  const search = resolvedParams.search || "";
  const role = resolvedParams.role || "";
  const sortBy = resolvedParams.sortBy || "date";
  const sortOrder = resolvedParams.sortOrder || "desc";

  const pageSize = 10;

  const [{ totalItems, users }, roles] = await Promise.all([
    fetchAdminUsersPaged({
      page: currentPage,
      pageSize,
      search,
      role,
      sortBy,
      sortOrder,
    }),
    fetchAllUserRoles(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Users Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Inspect customer accounts, adjust wallet balances, view delivery
          coordinates, and adjust authorization roles ({totalItems} registered).
        </p>
      </div>

      <UsersFilterBar roles={roles} />

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden p-6">
        <Suspense fallback={<UsersTableSkeleton />}>
          <UsersTable initialUsers={users} roles={roles} />

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
