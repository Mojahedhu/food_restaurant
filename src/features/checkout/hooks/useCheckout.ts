"use client";
import { useState } from "react";
import { toast } from "sonner";
import { delay } from "@/lib/utils";
import { CartItem } from "@/stores/cart/cartStore";
import { Session } from "next-auth";
import { Address } from "@/../types/sanityTypes";

interface CheckoutPayload {
  items: CartItem[];
  deliveryAddress: Address;
  paymentMethod: "online" | "cod";
  userId?: string;
  session: Session | null;
}

export const useCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState<
    null | "connecting" | "processing"
  >(null);

  const preloadStripePage = async (url: string) => {
    return new Promise<void>((resolve) => {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = new URL(url).origin;
      link.onload = () => resolve();
      link.onerror = () => resolve(); // don't block execution if it fails
      document.head.appendChild(link);
      setTimeout(resolve, 300); // safety fallback
    });
  };

  const handlePlaceOrder = async (payload: CheckoutPayload) => {
    setLoading(true);
    setOrderLoading("connecting");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response format");
      }

      if (!res.ok) {
        throw new Error(data?.message || "Checkout failed to initialize");
      }

      if (!data?.url) {
        throw new Error("Missing checkout destination URL from server");
      }

      setOrderLoading("processing");
      await Promise.all([delay(1500), preloadStripePage(data.url)]);

      // Navigate safely to gateway or success redirect
      window.location.href = data.url;
    } catch (err) {
      const error = err as Error;
      console.error("[CHECKOUT_CLIENT_ERROR]", error);
      toast.error(
        error.message || "An unexpected error occurred during checkout",
      );

      // Delay dismissal slightly to prevent jarring UI flashes on error
      await delay(1000);
      setLoading(false);
      setOrderLoading(null);
    }
  };

  return { handlePlaceOrder, loading, orderLoading };
};
