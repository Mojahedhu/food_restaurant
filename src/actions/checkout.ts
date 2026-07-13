"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Initiates a secure checkout session by setting an HttpOnly cookie
 * before redirecting the user. This prevents client-side tampering
 * and enforces the 60-second time-limited checkout access rule.
 */
export async function initiateCheckoutAction(addressId?: string) {
  // Set the intent cookie securely on the server
  (await cookies()).set({
    name: "checkoutIntent",
    value: "cart",
    maxAge: 60, // 60 seconds
    httpOnly: true, // Prevents client-side JS from reading it
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  // Construct query params
  const sp = new URLSearchParams();
  if (addressId) {
    sp.set("addressId", addressId);
  }

  // Redirect to checkout
  const queryString = sp.toString() ? `?${sp.toString()}` : "";
  redirect(`/checkout${queryString}`);
}
