"use server";

import { assertAdmin, checkAdmin } from "@/lib/auth-guard";
import { UserSummary, OrderSummary, AddressSummary } from "@/types/admin";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import auth from "../../auth";
import { ServiceError } from "@/lib/services/errors";
import {
  fetchAdminUsersPagedService,
  fetchAllUserRolesService,
  saveUserDetailsService,
  updateUserRoleService,
  adjustUserWalletService,
  fetchUserAddressesService,
  fetchUserOrdersService,
  deleteUserService,
} from "@/lib/services/admin.user.service";

const SaveUserSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,}$/, "Phone number must be at least 10 digits")
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

const DeleteUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

interface FetchUsersParams {
  page: number;
  pageSize: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: string;
}

export async function fetchAdminUsersPaged(params: FetchUsersParams) {
  await checkAdmin();
  try {
    return await fetchAdminUsersPagedService(params);
  } catch (error) {
    console.error("Failed to fetch users on server:", error);
    return { totalItems: 0, users: [] };
  }
}

export async function fetchAllUserRoles() {
  await checkAdmin();
  try {
    return await fetchAllUserRolesService();
  } catch (error) {
    console.error("Failed to fetch user roles:", error);
    return [];
  }
}

export async function saveUserDetailsAction(
  payload: unknown,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  
  try {
    const parsed = SaveUserSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(", "),
      };
    }

    await saveUserDetailsService(parsed.data);

    // @ts-ignore
    revalidateTag("users", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error("Failed to save user details:", error);
    return { success: false, error: "Database save failed" };
  }
}

export async function updateUserRoleAction(
  payload: unknown,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  
  try {
    const parsed = UpdateRoleSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, error: "Invalid payload parameters" };
    }

    const { userId, roleRefId } = parsed.data;

    await updateUserRoleService(userId, roleRefId);

    // @ts-ignore
    revalidateTag("users", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error("Failed to update user role:", error);
    return { success: false, error: "Failed to update role in database" };
  }
}

export async function adjustUserWalletAction(
  payload: unknown,
): Promise<{ success: boolean; error?: string; newBalance?: number }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  
  try {
    const parsed = AdjustWalletSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, error: "Invalid wallet adjustment data" };
    }

    const { userId, amount } = parsed.data;

    const newBalance = await adjustUserWalletService(userId, amount);

    // @ts-ignore
    revalidateTag("users", "max");
    return { success: true, newBalance };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error("Failed to adjust user wallet:", error);
    return { success: false, error: "Wallet adjustment failed" };
  }
}

export async function fetchUserAddresses(userId: string) {
  await checkAdmin();
  try {
    return await fetchUserAddressesService(userId);
  } catch (error) {
    console.error("Failed to fetch user addresses:", error);
    return [];
  }
}

export async function fetchUserOrders(userEmail: string) {
  await checkAdmin();
  try {
    return await fetchUserOrdersService(userEmail);
  } catch (error) {
    console.error("Failed to fetch user orders:", error);
    return [];
  }
}

export async function deleteUserAction(
  payload: unknown,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;

  const parsed = DeleteUserSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: "Invalid User ID structure" };
  }

  const { userId } = parsed.data;

  try {
    const session = await auth();
    const operatorId = session?.user?.id;

    await deleteUserService(userId, operatorId);

    // @ts-ignore
    revalidateTag("users", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error(`Failed to soft-delete user ${userId} in Sanity:`, error);
    return {
      success: false,
      error: "Failed to delete user account due to a database error.",
    };
  }
}
