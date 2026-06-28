# Plan: Server Actions Security (Hybrid Model)

This plan implements authentication and authorization security controls (Primary Guard) across all administrative server action files. It adopts a **Hybrid Security Pattern** designed to keep your frontend custom hooks and component types clean without forcing extensive type refactoring.

---

## 1. The Hybrid Security Pattern

- **For Read Actions (Queries):**
  We use `await checkAdmin()`. This function **throws** an error if unauthorized. Because throwing an error does not change the success return type, the TypeScript signatures of your query functions remain unchanged (e.g., `Promise<Order[]>` or `Promise<DashboardStats>`).
- **For Write Actions (Mutations):**
  We use `const guard = await assertAdmin()`. This returns `{ success: false, error: "..." }` on authorization failure. Since mutation actions already return status objects, this aligns perfectly with existing types.
- **Global Admin Error Boundary (`error.tsx`):**
  We place an `error.tsx` file inside `src/app/admin/` to automatically catch any thrown query authorization errors and display a beautiful, secure "Access Denied" screen instead of crashing the site.

---

## 2. Proposed Changes

### A. Security Infrastructure

#### [NEW] [auth-guard.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/lib/auth-guard.ts)

Create the centralized authorization helper containing both helpers.

```typescript
import { auth } from "@/auth";

/**
 * Asserts that the current user is an authenticated administrator.
 * Returns a standardized error response. Used primarily in mutations.
 */
export async function assertAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return {
      success: false,
      error: "Unauthorized access. Admin privileges required.",
    };
  }
  return { success: true, session };
}

/**
 * Checks that the current user is an authenticated administrator.
 * Throws an error on failure. Used primarily in queries to preserve return types.
 */
export async function checkAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    throw new Error("Unauthorized access. Admin privileges required.");
  }
  return session;
}
```

---

### B. Admin Error Boundary

#### [NEW] [error.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/app/admin/error.tsx)

Add an error boundary to intercept thrown authorization errors.

```tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error boundary caught:", error);
  }, [error]);

  const isUnauthorized =
    error.message.includes("Unauthorized access") ||
    error.message.includes("Admin privileges required");

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="p-4 bg-red-50 rounded-full dark:bg-red-950/20 mb-6">
        <Lock className="w-12 h-12 text-red-500" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-3">
        {isUnauthorized ? "Access Denied" : "Something went wrong"}
      </h1>
      <p className="text-base text-gray-600 dark:text-gray-400 max-w-md mb-8">
        {isUnauthorized
          ? "You do not have the required administrative permissions to view this section of the dashboard."
          : "An unexpected error occurred while loading the admin panel data."}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {isUnauthorized ? (
          <>
            <Button asChild variant="default">
              <Link href="/auth/signin?callbackUrl=/admin">
                Sign In as Admin
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => reset()} variant="default">
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
```

---

### C. Server Actions Protection (Function-by-Function)

#### [MODIFY] [admin-dashboard.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/actions/admin-dashboard.ts)

Add `await checkAdmin()` at the top of these queries:

1. `fetchDashboardMetrics`
2. `fetchDashboardRecentActivity`
3. `fetchSalesTrendsChartData`
4. `fetchOrderStatusDistribution`

#### [MODIFY] [admin-orders.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/actions/admin-orders.ts)

- **Queries (Add `await checkAdmin()`):**
  1. `fetchAdminOrders`
  2. `fetchAdminOrdersPaged`
- **Mutations (Add `assertAdmin()` check):**
  1. `updateOrderAction`
     ```typescript
     const guard = await assertAdmin();
     if (!guard.success) return guard;
     ```

#### [MODIFY] [admin-products.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/actions/admin-products.ts)

- **Queries (Add `await checkAdmin()`):**
  1. `fetchAdminProductsPaged`
  2. `fetchAllCategories`
- **Mutations (Add `assertAdmin()` check):**
  1. `toggleProductAvailability`
  2. `uploadProductImageAction`
  3. `saveProductAction`
  4. `createCategoryAction`

#### [MODIFY] [admin-reviews.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/actions/admin-reviews.ts)

- **Queries (Add `await checkAdmin()`):**
  1. `fetchAdminReviewsPaged`
  2. `fetchAdminReviewMetrics`
- **Mutations (Add `assertAdmin()` check):**
  1. `approveReviewAction`
  2. `rejectReviewAction`
  3. `replyToReviewAction`
  4. `deleteReviewAction`

#### [MODIFY] [admin-users.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/actions/admin-users.ts)

- **Queries (Add `await checkAdmin()`):**
  1. `fetchAdminUsersPaged`
  2. `fetchAllUserRoles`
  3. `fetchUserAddresses`
  4. `fetchUserOrders`
- **Mutations (Add `assertAdmin()` check):**
  1. `saveUserDetailsAction`
  2. `updateUserRoleAction`
  3. `adjustUserWalletAction`

#### [MODIFY] [admin-restaurant.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/actions/admin-restaurant.ts)

- **Queries (Add `await checkAdmin()`):**
  1. `fetchAdminRestaurants`
  2. `fetchRestaurantDetails`
  3. `fetchAllSchedules`
- **Mutations (Add `assertAdmin()` check):**
  1. `assignScheduleToRestaurantAction`
  2. `createAndLinkScheduleAction`
  3. `deleteScheduleAction`
  4. `toggleRestaurantActiveAction`
  5. `uploadRestaurantImageAction`
  6. `saveRestaurantDetailsAction`
  7. `saveOpeningHoursAction`

---

## 3. Verification Plan

### Automated Checks

Ensure all files compile cleanly:

```powershell
pnpm build
```

### Manual Testing

1. Navigate to `/admin` dashboard as a non-admin user (e.g., standard guest or member role) and verify that it hits the admin error boundary showing "Access Denied".
2. Invoke server mutations directly (e.g. from browser console) and verify they return `{ success: false, error: "Unauthorized access. Admin privileges required." }`.
