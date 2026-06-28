import auth from "../../auth";

/**
 * Asserts that the current user is an authenticated administrator.
 * Primarily used in mutations (write actions) to return standardized error responses.
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
 * Asserts that the current user is an authenticated administrator.
 * Primarily used in queries (fetch actions) to throw an error if unauthorized.
 */
export async function checkAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    throw new Error("Unauthorized access. Admin privileges required.");
  }
  return session;
}
