"use client";

import { useTransition } from "react";
import { useCartStore } from "@/stores/cart/cartStore";
import { useRouter } from "next/navigation";
import { initiateCheckoutAction } from "@/actions/checkout";

// Constants (Should ideally be moved to a shared config or fetched from DB)
const CART_CONFIG = {
  DELIVERY_FEE: 5,
  FREE_DELIVERY_THRESHOLD: 500,
  TAX_RATE: 0.1, // 10%
} as const;

export function useCartSummary(addressId?: string) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const items = useCartStore((state) => state.items) || [];
  const hasHydrated = useCartStore((state) => state._hasHydrated);

  // Safe Calculations
  const subtotal = items.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0,
  );

  const remainingAmount = Math.max(
    0,
    CART_CONFIG.FREE_DELIVERY_THRESHOLD - subtotal,
  );
  const finalDeliveryFee = remainingAmount === 0 ? 0 : CART_CONFIG.DELIVERY_FEE;
  const taxAmount = subtotal * CART_CONFIG.TAX_RATE;
  const total = subtotal + finalDeliveryFee + taxAmount;

  // Handler for Checkout Intent
  const handleCheckoutIntent = (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      // Execute the Server Action to securely set the time-limited
      // HttpOnly cookie and redirect the user.
      startTransition(() => {
        initiateCheckoutAction(addressId);
      });
    } else {
      router.push("/auth/signin?callbackUrl=/cart", { scroll: false });
    }
  };

  return {
    items,
    hasHydrated,
    subtotal,
    taxAmount,
    deliveryFee: finalDeliveryFee,
    remainingAmount,
    total,
    handleCheckoutIntent,
    isPending, // Can be used to show a loading spinner on the button
  };
}
