import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { UserSummary, OrderSummary, AddressSummary } from "@/types/admin";
import { groq } from "next-sanity";
import { ServiceError } from "./errors";

interface FetchUsersParams {
  page: number;
  pageSize: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: string;
}

export async function fetchAdminUsersPagedService({
  page,
  pageSize,
  search = "",
  role = "",
  sortBy = "date",
  sortOrder = "desc",
}: FetchUsersParams) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  let filterClauses = `_type == "user" && coalesce(isDeleted, false) == false`;
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
}

export async function fetchAllUserRolesService() {
  const query = groq`*[_type == "userRole" && isActive == true] | order(priority desc) { _id, name }`;
  const { data: roles } = await sanityFetch({
    query,
    params: {},
    tags: ["userRoles"],
  });
  return roles as Array<{ _id: string; name: string }>;
}

export async function saveUserDetailsService(data: { userId: string; name: string; phoneNumber?: string; bio?: string }) {
  const { userId, name, phoneNumber, bio } = data;

  await client
    .patch(userId)
    .set({
      name,
      phoneNumber: phoneNumber || "",
      bio: bio || "",
    })
    .commit();
}

export async function updateUserRoleService(userId: string, roleRefId: string) {
  await client
    .patch(userId)
    .set({
      role: {
        _type: "reference",
        _ref: roleRefId,
      },
    })
    .commit();
}

export async function adjustUserWalletService(userId: string, amount: number): Promise<number> {
  const existing = await client.fetch(
    groq`*[_id == $id][0] { walletBalance }`,
    { id: userId },
  );
  const current = existing?.walletBalance || 0;
  const nextBalance = Math.max(0, current + amount);

  await client.patch(userId).set({ walletBalance: nextBalance }).commit();
  return nextBalance;
}

export async function fetchUserAddressesService(userId: string) {
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
}

export async function fetchUserOrdersService(userEmail: string) {
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
}

export async function deleteUserService(userId: string, operatorId?: string) {
  if (operatorId && operatorId === userId) {
    throw new ServiceError("Action Denied: You cannot delete your own administrative account.");
  }

  await client
    .patch(userId)
    .set({
      name: "Deleted Account",
      email: `deleted-${userId.slice(0, 8)}@disabled-account.com`,
      phoneNumber: "",
      bio: "",
      walletBalance: 0,
      image: null,
      isDeleted: true,
    })
    .commit();
}
