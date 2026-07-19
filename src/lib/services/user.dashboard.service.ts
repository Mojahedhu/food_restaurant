import { client } from "@/sanity/lib/client";
import { Order } from "@/../types/sanityTypes";

/**
 * Fetches the initial recent orders for the user dashboard.
 * Encapsulates the Sanity query logic and error fallback to keep the Server Component cleanly abstracted.
 *
 * @param userId - The ID of the authenticated user
 * @param isAdmin - Whether the user has administrative privileges
 * @returns Array of recent orders (up to 5)
 */
export async function fetchUserDashboardOrders(
  userId: string,
  isAdmin: boolean,
): Promise<Order[]> {
  const query = isAdmin
    ? `*[_type == "order"] | order(_createdAt desc) [0...5]`
    : `*[_type == "order" && user._ref == $userId] | order(_createdAt desc) [0...5]`;

  try {
    if (isAdmin) {
      return await client.fetch<Order[]>(query);
    }

    return await client.fetch<Order[]>(query, { userId });
  } catch (error) {
    console.error("[Dashboard Service] Failed to fetch initial orders:", error);
    // Absolute fallback: prevent client-side crashing by injecting an empty array
    return [];
  }
}
