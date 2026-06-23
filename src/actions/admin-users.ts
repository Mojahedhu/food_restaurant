"use server";

import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { UserSummary, OrderSummary, AddressSummary } from "@/types/admin";
import { groq } from "next-sanity";
import { revalidateTag } from "next/cache";
import { z } from "zod";

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

    revalidateTag("users", "max");
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

    revalidateTag("users", "max");
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

    revalidateTag("users", "max");
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
    return addresses as AddressSummary[];
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
