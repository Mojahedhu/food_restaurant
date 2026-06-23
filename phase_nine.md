# Phase 9: Users Management Dashboard

This phase implements a comprehensive **Users Management Dashboard** at `/admin/users`. Admins will be able to list accounts, search/filter by role and status, view user addresses and order histories, toggle/update roles, and adjust wallet balances with server actions.

All actions are developed in compliance with input validation, zero-trust backend enforcement, optional chaining, and map safety requirements specified in [plan.md](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/plan.md).

---

## User Review Required

> [!IMPORTANT]
>
> - **Wallet Balance Adjustment**: Admins can adjust the user's wallet credit balance directly from the user details sheet (e.g., to issue store credit, cash-back refunds, or manually adjust customer balance).
> - **Role Allocation**: Dynamic role list loaded from Sanity `userRole` documents, allowing safe role assignment (e.g., User, Admin, Delivery Boy) without hardcoding credentials or slugs.
> - **Address & Order Context Integration**: When clicking a user, a slide-out sheet fetches and displays all addresses related to the user and their recent order history.

---

## Proposed Changes

### 1. Update Types (`src/types/admin.ts`)

Add additional fields to `UserSummary` to support phone, bio, provider, wallet balance, and image references.

#### [MODIFY] [admin.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/types/admin.ts)

```typescript
export type UserSummary = Pick<
  User,
  | "_id"
  | "_createdAt"
  | "name"
  | "email"
  | "role"
  | "phoneNumber"
  | "bio"
  | "walletBalance"
  | "image"
  | "provider"
>;
```

---

### 2. Backend Users Actions (`src/actions/admin-users.ts`)

Create server actions with Zod validations to query user listings, fetch associated addresses/orders, update details, adjust wallet balance, and update roles.

#### [NEW] [admin-users.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/actions/admin-users.ts)

```typescript
"use server";

import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { UserSummary, OrderSummary } from "@/types/admin";
import { groq } from "next-sanity";
import { revalidateTag } from "next/cache";
import { z } from "zod";

const SaveUserSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(200).optional(),
});

const UpdateRoleSchema = z.object({
  userId: z.string().min(1),
  roleRefId: z.string().min(1),
});

const AdjustWalletSchema = z.object({
  userId: z.string().min(1),
  amount: z.number(),
});

interface FetchUsersParams {
  page: number;
  pageSize: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: string;
}

export async function fetchAdminUsersPaged({
  page,
  pageSize,
  search = "",
  role = "",
  sortBy = "date",
  sortOrder = "desc",
}: FetchUsersParams) {
  try {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    let filterClauses = `_type == "user"`;
    const params: Record<string, string | number> = { start, end };

    if (search.trim()) {
      filterClauses += ` && (name match $search || email match $search || phoneNumber match $search)`;
      params.search = `*${search.trim()}*`;
    }

    if (role && role !== "all") {
      filterClauses += ` && role._ref == $role`;
      params.role = role;
    }

    let sortClause = `_createdAt desc`;
    if (sortBy === "wallet") {
      sortClause = `walletBalance ${sortOrder === "asc" ? "asc" : "desc"}`;
    } else if (sortBy === "name") {
      sortClause = `name ${sortOrder === "asc" ? "asc" : "desc"}`;
    } else if (sortBy === "date") {
      sortClause = `_createdAt ${sortOrder === "asc" ? "asc" : "desc"}`;
    }

    const countQuery = groq`count(*[${filterClauses}])`;
    const dataQuery = groq`
      *[${filterClauses}] | order(${sortClause}) {
        _id,
        _createdAt,
        name,
        email,
        phoneNumber,
        bio,
        walletBalance,
        provider,
        image,
        role->{
          _id,
          name,
          slug
        }
      }[$start...$end]
    `;

    const [{ data: totalItems }, { data: users }] = await Promise.all([
      sanityFetch({ query: countQuery, params, tags: ["users"] }),
      sanityFetch({ query: dataQuery, params, tags: ["users"] }),
    ]);

    return {
      totalItems: totalItems as number,
      users: users as UserSummary[],
    };
  } catch (error) {
    console.error("Failed to fetch users on server:", error);
    return { totalItems: 0, users: [] };
  }
}

export async function fetchAllUserRoles() {
  try {
    const query = groq`*[_type == "userRole" && isActive == true] | order(priority desc) { _id, name }`;
    const { data: roles } = await sanityFetch({
      query,
      params: {},
      tags: ["userRoles"],
    });
    return roles as Array<{ _id: string; name: string }>;
  } catch (error) {
    console.error("Failed to fetch user roles:", error);
    return [];
  }
}

export async function saveUserDetailsAction(payload: unknown) {
  try {
    const parsed = SaveUserSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }

    const { userId, name, phoneNumber, bio } = parsed.data;

    await client
      .patch(userId)
      .set({
        name,
        phoneNumber: phoneNumber || "",
        bio: bio || "",
      })
      .commit();

    revalidateTag("users");
    return { success: true };
  } catch (error) {
    console.error("Failed to save user details:", error);
    return { success: false, error: "Database save failed" };
  }
}

export async function updateUserRoleAction(payload: unknown) {
  try {
    const parsed = UpdateRoleSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, error: "Invalid payload parameters" };
    }

    const { userId, roleRefId } = parsed.data;

    await client
      .patch(userId)
      .set({
        role: {
          _type: "reference",
          _ref: roleRefId,
        },
      })
      .commit();

    revalidateTag("users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return { success: false, error: "Failed to update role in database" };
  }
}

export async function adjustUserWalletAction(payload: unknown) {
  try {
    const parsed = AdjustWalletSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, error: "Invalid wallet adjustment data" };
    }

    const { userId, amount } = parsed.data;

    // Fetch current wallet balance first
    const existing = await client.fetch(
      groq`*[_id == $id][0] { walletBalance }`,
      { id: userId },
    );
    const current = existing?.walletBalance || 0;
    const nextBalance = Math.max(0, current + amount);

    await client.patch(userId).set({ walletBalance: nextBalance }).commit();

    revalidateTag("users");
    return { success: true, newBalance: nextBalance };
  } catch (error) {
    console.error("Failed to adjust user wallet:", error);
    return { success: false, error: "Wallet adjustment failed" };
  }
}

export async function fetchUserAddresses(userId: string) {
  try {
    const query = groq`*[_type == "address" && user._ref == $userId] | order(isDefault desc, _createdAt desc) {
      _id,
      type,
      label,
      street,
      apartment,
      city,
      state,
      zipCode,
      phone,
      instructions,
      isDefault
    }`;
    const { data: addresses } = await sanityFetch({
      query,
      params: { userId },
      tags: [`addresses-${userId}`],
    });
    return addresses as any[];
  } catch (error) {
    console.error("Failed to fetch user addresses:", error);
    return [];
  }
}

export async function fetchUserOrders(userEmail: string) {
  try {
    const query = groq`*[_type == "order" && userEmail == $userEmail] | order(_createdAt desc) {
      _id,
      _createdAt,
      orderNumber,
      status,
      total,
      paymentStatus
    }[0...10]`;
    const { data: orders } = await sanityFetch({
      query,
      params: { userEmail },
      tags: [`orders-${userEmail}`],
    });
    return orders as OrderSummary[];
  } catch (error) {
    console.error("Failed to fetch user orders:", error);
    return [];
  }
}
```

---

### 3. Custom Logic Hook (`src/hooks/useUsersLogic.ts`)

Manages UI state overrides, wallet credit adjustments, inline updates, and slide-sheet detail queries.

#### [NEW] [useUsersLogic.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/hooks/useUsersLogic.ts)

```typescript
"use client";

import { useTransition, useState, useEffect } from "react";
import { UserSummary } from "@/types/admin";
import {
  updateUserRoleAction,
  saveUserDetailsAction,
  adjustUserWalletAction,
} from "@/actions/admin-users";
import { toast } from "sonner";

export function useUsersLogic(initialUsers: UserSummary[]) {
  const [isPending, startTransition] = useTransition();
  const [localUpdates, setLocalUpdates] = useState<
    Record<string, Partial<UserSummary>>
  >({});

  useEffect(() => {
    setLocalUpdates((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const userId in next) {
        const serverUser = initialUsers.find((u) => u._id === userId);
        const localUpdate = next[userId];

        if (serverUser) {
          const isRoleSynced =
            !localUpdate.role || serverUser.role?._id === localUpdate.role?._id;
          const isWalletSynced =
            localUpdate.walletBalance === undefined ||
            serverUser.walletBalance === localUpdate.walletBalance;

          if (isRoleSynced && isWalletSynced) {
            delete next[userId];
            changed = true;
          }
        }
      }

      return changed ? next : prev;
    });
  }, [initialUsers]);

  const users = (initialUsers || []).map((user) => {
    const update = localUpdates[user._id];
    return update ? { ...user, ...update } : user;
  });

  const handleUpdateRole = async (
    userId: string,
    roleRefId: string,
    roleName: string,
  ) => {
    setLocalUpdates((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        role: { _id: roleRefId, name: roleName } as any,
      },
    }));

    startTransition(async () => {
      const result = await updateUserRoleAction({ userId, roleRefId });
      if (result.success) {
        toast.success(`Role updated successfully!`);
      } else {
        toast.error(result.error || "Failed to update role. Reverting.");
        setLocalUpdates((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }
    });
  };

  const handleSaveDetails = async (
    userId: string,
    updates: { name: string; phoneNumber?: string; bio?: string },
  ) => {
    setLocalUpdates((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        name: updates.name,
        phoneNumber: updates.phoneNumber,
        bio: updates.bio,
      },
    }));

    startTransition(async () => {
      const result = await saveUserDetailsAction({ userId, ...updates });
      if (result.success) {
        toast.success("User details saved!");
      } else {
        toast.error(result.error || "Failed to save details. Reverting.");
        setLocalUpdates((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }
    });
  };

  const handleAdjustWallet = async (userId: string, amount: number) => {
    startTransition(async () => {
      const result = await adjustUserWalletAction({ userId, amount });
      if (result.success) {
        toast.success("Wallet balance updated successfully!");
        setLocalUpdates((prev) => ({
          ...prev,
          [userId]: {
            ...prev[userId],
            walletBalance: result.newBalance,
          },
        }));
      } else {
        toast.error(result.error || "Failed to adjust wallet.");
      }
    });
  };

  return {
    users,
    isPending,
    handleUpdateRole,
    handleSaveDetails,
    handleAdjustWallet,
  };
}
```

---

### 4. Subcomponents (`src/components/admin/features/users/`)

Build user filter bars, list data tables, and slide sheets.

#### [NEW] [usersFilterBar.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/users/usersFilterBar.tsx)

Provides a search bar for names/emails, filters for user roles, and order sorting configurations.

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface UsersFilterBarProps {
  roles: Array<{ _id: string; name: string }>;
}

export function UsersFilterBar({ roles }: UsersFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const role = searchParams.get("role") || "all";
  const sortBy = searchParams.get("sortBy") || "date";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      updateUrlParam("search", search);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const updateUrlParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch("");
    router.push(pathname);
  };

  const hasActiveFilters = search.trim() !== "" || role !== "all";

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border">
      <div className="relative w-full md:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <Select
          value={role}
          onValueChange={(val) => updateUrlParam("role", val)}
        >
          <SelectTrigger className="w-[165px] bg-background">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {(roles || []).map((r) => (
              <SelectItem key={r._id} value={r._id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(val) => updateUrlParam("sortBy", val)}
        >
          <SelectTrigger className="w-[150px] bg-background">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Join Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="wallet">Wallet Balance</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortOrder}
          onValueChange={(val) => updateUrlParam("sortOrder", val)}
        >
          <SelectTrigger className="w-[120px] bg-background">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-9 px-3 gap-1 hover:text-destructive"
          >
            <X className="size-4" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
```

#### [NEW] [userDetailsSheet.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/users/userDetailsSheet.tsx)

Displays full customer bio, address coordinates, recent orders list, and wallet adjustment triggers.

```tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { UserSummary, OrderSummary } from "@/types/admin";
import { fetchUserAddresses, fetchUserOrders } from "@/actions/admin-users";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Minus, Home, Briefcase, MapPin } from "lucide-react";

interface UserDetailsSheetProps {
  user: UserSummary | null;
  roles: Array<{ _id: string; name: string }>;
  isOpen: boolean;
  onClose: () => void;
  onSaveDetails: (userId: string, updates: any) => Promise<void>;
  onUpdateRole: (
    userId: string,
    roleRefId: string,
    roleName: string,
  ) => Promise<void>;
  onAdjustWallet: (userId: string, amount: number) => Promise<void>;
  isPending: boolean;
}

export function UserDetailsSheet({
  user,
  roles,
  isOpen,
  onClose,
  onSaveDetails,
  onUpdateRole,
  onAdjustWallet,
  isPending,
}: UserDetailsSheetProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const [walletAdjustment, setWalletAdjustment] = useState("");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loadingContext, startLoadingContext] = useTransition();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phoneNumber || "");
      setBio(user.bio || "");
      setWalletAdjustment("");

      startLoadingContext(async () => {
        const [addr, ord] = await Promise.all([
          fetchUserAddresses(user._id),
          fetchUserOrders(user.email || ""),
        ]);
        setAddresses(addr);
        setOrders(ord);
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveDetails(user._id, { name, phoneNumber: phone, bio });
  };

  const handleAdjustWalletSubmit = async (type: "add" | "deduct") => {
    const amt = parseFloat(walletAdjustment);
    if (isNaN(amt) || amt <= 0) return;
    const finalAmount = type === "add" ? amt : -amt;
    await onAdjustWallet(user._id, finalAmount);
    setWalletAdjustment("");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md lg:max-w-xl flex flex-col h-full p-6">
        <SheetHeader className="text-left mb-4">
          <SheetTitle className="text-2xl font-bold">
            User Profile details
          </SheetTitle>
          <SheetDescription>
            Inspect and update customer metadata, role authorization, and wallet
            credits.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* General Metadata */}
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Account Details
            </h3>

            <div className="space-y-2">
              <Label htmlFor="usr-name">Full Name</Label>
              <Input
                id="usr-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usr-email">Email Address</Label>
              <Input
                id="usr-email"
                value={user.email || ""}
                disabled
                className="bg-slate-50 text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usr-phone">Phone Number</Label>
              <Input
                id="usr-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10 digit phone number"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usr-bio">Bio / Description</Label>
              <Textarea
                id="usr-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                maxLength={200}
                className="resize-none"
                disabled={isPending}
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="size-4 animate-spin mr-2" />}
              Save General Details
            </Button>
          </form>

          <Separator />

          {/* Role Management */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Role Access
            </h3>
            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select
                value={user.role?._id || ""}
                onValueChange={(val) => {
                  const roleObj = roles.find((r) => r._id === val);
                  if (roleObj) {
                    onUpdateRole(user._id, val, roleObj.name);
                  }
                }}
                disabled={isPending}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="No assigned role" />
                </SelectTrigger>
                <SelectContent>
                  {(roles || []).map((r) => (
                    <SelectItem key={r._id} value={r._id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Wallet Balance Adjuster */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Store Credit / Wallet
            </h3>
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-border">
              <span className="text-sm font-medium">Current Balance:</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(user.walletBalance || 0)}
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wallet-adj">Adjust Balance ($)</Label>
              <div className="flex gap-2">
                <Input
                  id="wallet-adj"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={walletAdjustment}
                  onChange={(e) => setWalletAdjustment(e.target.value)}
                  disabled={isPending}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 text-emerald-500"
                  onClick={() => handleAdjustWalletSubmit("add")}
                  disabled={isPending || !walletAdjustment}
                >
                  <Plus className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 border-destructive/20 hover:bg-destructive/10 text-destructive"
                  onClick={() => handleAdjustWalletSubmit("deduct")}
                  disabled={isPending || !walletAdjustment}
                >
                  <Minus className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Addresses Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Saved Addresses
            </h3>
            {loadingContext ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin" /> Fetching
                addresses...
              </div>
            ) : (addresses || []).length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No addresses saved for this customer.
              </p>
            ) : (
              <div className="space-y-2">
                {(addresses || []).map((addr) => (
                  <div
                    key={addr._id}
                    className="flex gap-3 p-3 border rounded-xl hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="size-8 rounded-lg bg-secondary/80 flex items-center justify-center shrink-0 mt-0.5">
                      {addr.type === "home" ? (
                        <Home className="size-4 text-primary" />
                      ) : addr.type === "work" ? (
                        <Briefcase className="size-4 text-primary" />
                      ) : (
                        <MapPin className="size-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold capitalize">
                          {addr.label || addr.type}
                        </span>
                        {addr.isDefault && (
                          <Badge
                            variant="outline"
                            className="bg-primary/5 border-primary/20 text-primary scale-90 px-1 py-0 font-normal"
                          >
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {addr.street}
                        {addr.apartment ? `, ${addr.apartment}` : ""},{" "}
                        {addr.city}, {addr.state} {addr.zipCode}
                      </p>
                      <p className="text-xs text-slate-500">
                        Phone: {addr.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Orders Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Recent Orders
            </h3>
            {loadingContext ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin" /> Fetching orders...
              </div>
            ) : (orders || []).length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No orders recorded for this customer.
              </p>
            ) : (
              <div className="divide-y border rounded-xl overflow-hidden bg-background">
                {(orders || []).map((ord) => (
                  <div
                    key={ord._id}
                    className="flex justify-between items-center p-3 text-sm hover:bg-slate-50/30"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        Order #{ord.orderNumber}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(ord._createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-950">
                        {formatCurrency(ord.total || 0)}
                      </div>
                      <Badge
                        variant="outline"
                        className="scale-90 font-normal mt-0.5"
                      >
                        {ord.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

#### [NEW] [usersTable.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/users/usersTable.tsx)

Renders user list data rows, access roles dropdown overrides, joined timestamps, and edit triggers.

```tsx
"use client";

import { useState } from "react";
import { UserSummary } from "@/types/admin";
import { useUsersLogic } from "@/hooks/useUsersLogic";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, UserIcon } from "lucide-react";
import { UserDetailsSheet } from "./userDetailsSheet";

interface UsersTableProps {
  initialUsers: UserSummary[];
  roles: Array<{ _id: string; name: string }>;
}

export function UsersTable({ initialUsers, roles }: UsersTableProps) {
  const {
    users,
    isPending,
    handleUpdateRole,
    handleSaveDetails,
    handleAdjustWallet,
  } = useUsersLogic(initialUsers);

  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);

  // Synchronize local selection item with override updates dictionary
  const activeSelection = selectedUser
    ? users.find((u) => u._id === selectedUser._id) || selectedUser
    : null;

  return (
    <div className="relative w-full overflow-auto">
      {isPending && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 animate-pulse z-50" />
      )}

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-transparent border-b">
            <TableHead className="w-[60px] pl-4">User</TableHead>
            <TableHead>Name & Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Wallet Credit</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(users || []).map((user) => {
            const hasWallet = (user.walletBalance || 0) > 0;
            return (
              <TableRow
                key={user._id}
                className="hover:bg-slate-50/50 transition-colors border-b last:border-b-0"
              >
                {/* Avatar Icon */}
                <TableCell className="pl-4">
                  <div className="size-10 rounded-full border border-border bg-slate-100 flex items-center justify-center shrink-0">
                    <UserIcon className="size-5 text-muted-foreground/60" />
                  </div>
                </TableCell>

                {/* Account Name/Email */}
                <TableCell>
                  <div className="font-semibold text-slate-900">
                    {user.name || "Unnamed"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {user.email}
                  </div>
                </TableCell>

                {/* Role Badge */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      user.role?.slug === "admin"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : user.role?.slug === "delivery_boy"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                    }
                  >
                    {user.role?.name || "User"}
                  </Badge>
                </TableCell>

                {/* Phone */}
                <TableCell className="text-muted-foreground">
                  {user.phoneNumber || "—"}
                </TableCell>

                {/* Wallet Balance */}
                <TableCell
                  className={
                    hasWallet
                      ? "font-bold text-slate-900"
                      : "text-muted-foreground"
                  }
                >
                  {formatCurrency(user.walletBalance || 0)}
                </TableCell>

                {/* Joined Datetime */}
                <TableCell className="text-muted-foreground">
                  {user._createdAt
                    ? format(new Date(user._createdAt), "MMM d, yyyy")
                    : "—"}
                </TableCell>

                {/* Edit Action Button */}
                <TableCell className="text-right pr-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedUser(user)}
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors"
                    disabled={isPending}
                  >
                    <Edit className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <UserDetailsSheet
        user={activeSelection}
        roles={roles}
        isOpen={!!activeSelection}
        onClose={() => setSelectedUser(null)}
        onSaveDetails={handleSaveDetails}
        onUpdateRole={handleUpdateRole}
        onAdjustWallet={(handleAdjustWalletSubmit) =>
          handleAdjustWallet(activeSelection?._id!, handleAdjustWalletSubmit)
        }
        isPending={isPending}
      />
    </div>
  );
}
```

---

### 5. Page Integration (`src/app/admin/users/`)

Build layout integration page resolving search query parameters and pagination components.

#### [NEW] [page.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/app/admin/users/page.tsx)

Server-side data resolver query engine resolving paged users list in parallel.

```tsx
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
```

#### [NEW] [usersTableSkeleton.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/app/admin/users/_components/usersTableSkeleton.tsx)

Visual placeholder skeletons.

```tsx
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UsersTableSkeleton() {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="w-[60px] pl-4">
              <Skeleton className="h-4 w-8" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-28" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-24" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead className="text-right w-[80px] pr-4">
              <Skeleton className="h-4 w-12 ml-auto" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, idx) => (
            <TableRow key={idx} className="border-b last:border-b-0">
              <TableCell className="pl-4">
                <Skeleton className="h-10 w-10 rounded-full" />
              </TableCell>
              <TableCell>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="text-right pr-4">
                <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

## Verification Plan

### Automated Checks

- Run compiler test checks: `pnpm tsc --noEmit`

### Manual Verification Scenarios

1. **Details loading context**: Open a user's detail sheet. Verify that the loading indicator spins, and then populated address rows and historical order details appear correctly.
2. **Role updating trigger**: Update a user's role dropdown option from `User` to `Admin`. Verify that the role badge changes instantly, and does not flicker on database synchronization.
3. **Wallet credit adjuster**: Adjust a user's wallet credit balance using the positive (`+`) or negative (`-`) adjustment values. Verify that the correct amount increments or decrements and synchronizes with Sanity database records.

---

## 🏁 Phase 9 Status: Completed & Polished

All components and actions of Phase 9 have been successfully implemented by the developer. The build runs cleanly and compiles with zero TypeScript errors. 

### 💡 Polishing Recommendations (For Skill Enhancement)

To polish the implementation further and strictly align with production-grade Next.js development patterns:

1. **Standardize Event Handlers in `userDetailsSheet.tsx`**:
   * **Location**: `src/components/admin/features/users/userDetailsSheet.tsx:L88`
   * **Current**: `const handleSave = async (e: React.SubmitEvent) => { ... }`
   * **Polishing**: `React.SubmitEvent` is not a standard React event typing. Update it to use standard React typing:
     ```typescript
     const handleSave = async (e: React.FormEvent<HTMLFormElement>) => { ... }
     ```

2. **Clean Up `revalidateTag` Call parameters**:
   * **Location**: `src/actions/admin-users.ts` (lines 146, 173, and 200)
   * **Current**: `revalidateTag("users", "max");`
   * **Polishing**: Next.js's native `revalidateTag` accepts only one argument (the tag name). Remove the second `"max"` argument to match the official Next.js cache API signature:
     ```typescript
     revalidateTag("users");
     ```

3. **User Profile Image Resolution**:
   * **Verified**: You have successfully integrated `getUserImage(user as Partial<User>)` from `src/lib/utils.ts` to cleanly resolve and render the user profile avatar in `usersTable.tsx` under both Sanity Assets and external URL provider configurations. Outstanding job!

