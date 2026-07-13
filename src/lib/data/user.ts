import { sanityFetch } from "@/sanity/lib/live";

/**
 * Checks if a user has any saved addresses by their email.
 * This ensures read-only data fetching stays strictly within the data layer.
 *
 * @param email - The user's email address
 * @returns boolean indicating if addresses exist
 */
export async function checkUserHasAddresses(email: string): Promise<boolean> {
  if (!email) return false;

  const query = `*[_type == "user" && email == $email][0]{
                  "hasAddresses": count(addresses) > 0
                  }`;
  try {
    const result = await sanityFetch({ query, params: { email } });
    const userWithAddresses = result.data as { hasAddresses: boolean };
    return userWithAddresses?.hasAddresses || false;
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return false;
  }
}
