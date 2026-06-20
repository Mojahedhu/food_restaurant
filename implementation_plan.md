# Admin Dashboard Implementation Plan

This document outlines the best-practice plan for building the Admin Dashboard for the Quick Food application using Next.js 16 and Sanity. The plan is based on the provided UI screenshots and adheres strictly to the architectural constraints: splitting logic from UI, progressive state management, optimistic updates, and strict typing. It also aligns with the existing project ecosystem (shadcn/ui, Zustand, Sanity client transactions).

## 1. Goal Description

To build a secure, performant, and highly interactive Admin Dashboard that allows administrators to manage Orders, Users, Products, and Reviews. The dashboard will feature real-time updates, optimistic UI feedback, and a clean separation of concerns using modern React hooks (`useOptimistic`, `useTransition`) and Next.js Server Actions.

## User Review Required

> [!IMPORTANT]  
> Please review the updated plan which incorporates your existing `shadcn/ui` components, state management patterns, and Sanity schemas. Once approved, you can implement this plan yourself for learning purposes as requested.

## 2. Architecture & File Structure

We will adopt a modular structure within the `src/app/admin` directory, separating reusable UI components, features, hooks, and server actions.

```text
src/
├── actions/
│   ├── admin-orders.ts      # Server Actions (using Sanity transactions, similar to address.ts)
│   ├── admin-products.ts    # Server Actions for products
│   └── admin-users.ts       # Server Actions for users
├── app/
│   └── admin/
│       ├── layout.tsx       # Admin shell layout (Sidebar + Header)
│       ├── page.tsx         # Dashboard Overview (redirects or shows summary)
│       ├── orders/
│       │   └── page.tsx     # Orders Management Page
│       ├── products/
│       │   └── page.tsx     # Products Management Page
│       └── users/
│           └── page.tsx     # Users Management Page
├── components/
│   └── admin/
│       ├── layout/          # Sidebar, Header, AdminPageShell
│       └── features/        # Smart components specific to features
│           ├── orders/
│           │   ├── OrdersTable.tsx         # Uses shadcn/ui Table
│           │   ├── OrderDetailsSheet.tsx   # Uses shadcn/ui Sheet (slides from side)
│           │   └── OrdersSummaryCards.tsx
│           ├── products/
│           │   └── ProductsTable.tsx
│           └── users/
│               └── UsersTable.tsx
├── hooks/
│   ├── useOrdersLogic.ts    # Custom hook separating logic from Orders UI
│   └── useOptimisticUpdate.ts # Generic hook wrapping useOptimistic
├── stores/
│   └── adminStore.ts        # Zustand store (follows cartStore.ts pattern)
└── types/
    └── admin.ts             # Specific mapped types derived from sanity.types.ts
```

## 3. Separation of Logic and UI

To maintain clean components, we will aggressively split business logic and data fetching from the rendering logic.

- **Server Components (Pages):** Responsible for fetching initial data from Sanity and passing it down as props.
- **Client Components (Views):** Responsible for UI interactivity. Uses `shadcn/ui` components for all standard elements (`Table`, `Sheet`, `Button`, `Select`, `Skeleton` for loading).
- **Custom Hooks:** All complex event handlers, state transitions, and server action invocations will live in custom hooks.

**Example Pattern:**

```tsx
// hooks/useOrdersLogic.ts
export function useOrdersLogic(initialOrders: Order[]) {
  const [isPending, startTransition] = useTransition();
  const [localUpdates, setLocalUpdates] = useState<Record<string, Partial<Order>>>( {});

  // Clean up local updates when server data catches up
  useEffect(() => {
    setLocalUpdates((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const orderId in next) {
        const serverOrder = initialOrders.find((o) => o._id === orderId);
        if (serverOrder && serverOrder.paymentStatus === next[orderId].paymentStatus) {
          delete next[orderId];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [initialOrders]);

  const orders = initialOrders.map((order) => {
    const update = localUpdates[order._id];
    return update ? { ...order, ...update } : order;
  });

  const handleUpdateStatus = async (orderId: string, newStatusId: string) => {
    setLocalUpdates((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], status: { _type: "reference", _ref: newStatusId } }
    }));

    startTransition(async () => {
      await updateOrderStatusAction(orderId, newStatusId);
    });
  };

  return { orders, isPending, handleUpdateStatus };
}

// components/admin/features/orders/OrdersTable.tsx
export function OrdersTable({ initialOrders }) {
  const { orders, isPending, handleUpdateStatus } = useOrdersLogic(initialOrders);
  // Pure rendering logic using shadcn/ui <Table>
}
```

## 4. State Management Strategy

We will follow a progressive approach to state management, escalating complexity only when necessary, and aligning with existing patterns (`cartStore.ts`).

1.  **Local State (`useState`):**
    - Used for simple UI toggles like simple input fields, or local component visibility.
2.  **Complex Local State (`useReducer`):**
    - Used for the **Order Details Sheet**. Editing an order involves multiple related fields (Order Status, Payment Status). `useReducer` provides a predictable way to manage this complex state object before saving changes to the server.
3.  **Global State (Zustand):**
    - **`adminStore.ts`**: Used for application-wide UI states. We will follow the established `cartStore.ts` pattern, potentially including persistence and hydration logic if the admin sidebar state or specific admin preferences need to persist across reloads.
    - Uses `sonner` (already installed) for global Toast notifications upon action success/failure.

## 5. Performance and UX

- **`shadcn/ui` Integrations:**
  - **`Sheet`**: Used for the "Order Details" and other slide-out forms, providing a native-feeling overlay from the side of the screen as requested.
  - **`Table`**: Used for Orders, Products, and Users listings.
  - **`Skeleton`**: Used for loading states while data is being fetched or mutated.
- **React Hooks:**
  - **`useOptimistic`**: Instant UI updates when changing order status. Automatically rolls back if the underlying Sanity transaction fails.
  - **`useTransition`**: Keeps the UI responsive during non-blocking transitions like filtering tables or navigating tabs.

## 6. Strict Typing with Sanity

We will strictly enforce TypeScript utilizing the existing generated types.

- **Base Types:** We will utilize the generated types from `sanity.types.ts` (e.g., `Order`, `Food`, `User`, `Review`, `OrderStatus`).
- **Mapped Types:** For components that only need a subset of data (like a table row), we will define specific interfaces to keep props clean and components decoupled from the full heavy object.

```typescript
// types/admin.ts
import { Order, OrderStatus } from "@/sanity.types";

export type OrderSummary = Pick<
  Order,
  "_id" | "customer" | "_createdAt" | "total" | "paymentStatus"
> & {
  status: OrderStatus;
};

export interface OrdersTableProps {
  orders: OrderSummary[];
}
```

## 7. Execution Strategy

Since you are undertaking this implementation for learning and skill development, **no files will be automatically generated or modified**. You can use this plan as your architectural blueprint.

Recommended implementation order for your learning journey:

1.  **Phase 1: Admin Shell & Routing:** Build the Layout with a Sidebar and Header.
2.  **Phase 2: Types & Data Fetching:** Define the `OrderSummary` type, create a Server Component (`app/admin/orders/page.tsx`), and fetch the data using groq queries against Sanity.
3.  **Phase 3: The Data Table:** Build `OrdersTable.tsx` using the `shadcn/ui` Table component.
4.  **Phase 4: The Slide-out Sheet:** Build `OrderDetailsSheet.tsx` using the `shadcn/ui` Sheet component. Manage its complex internal form state using `useReducer`.
5.  **Phase 5: Logic & Mutations:** Create `useOrdersLogic.ts` and `actions/admin-orders.ts`. Implement the Sanity transactions to update data, and wrap the UI calls in `useTransition` and local updates state overrides to handle eventual consistency.
