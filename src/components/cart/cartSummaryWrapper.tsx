"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowRight, Lock, MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import AddressSheet from "@/features/address/components/addressFormSheet";
import { Separator } from "../ui/separator";
import Link from "next/link";
import AddressCardsList from "@/features/address/components/addressCardsList";
import { useAddressStore } from "@/features/address/store/addressStore";
import { useLiveAddressActions } from "@/hooks/useLiveAddressActions";
import CardAddressSkeleton from "./cartAddressSkeleton";
import { useLiveAddress } from "@/hooks/useLiveAddress";
import FullAddressSheet from "@/features/address/components/fullAddressSheet";
import { useCartSummary } from "@/hooks/useCartSummary";

interface CartSummaryWrapperProps {
  isAuthenticated: boolean;
  userName?: string | undefined;
  userEmail?: string | undefined;
  hasAddresses: boolean;
  userId?: string | undefined;
}

const CartSummaryWrapper = ({
  isAuthenticated,
  userName,
  userId,
}: CartSummaryWrapperProps) => {
  // Local UI State
  const [openAddressFrom, setOpenAddressForm] = useState(false);
  const [openAddressSheet, setOpenAddressSheet] = useState(false);

  // Address Store State
  const { addresses } = useAddressStore();
  const isLoading = useAddressStore((s) => s.ui.initializing);
  const creating = useAddressStore((s) => s.ui.creating);
  const updating = useAddressStore((s) => s.ui.updatingId);

  const { createAddress, updateAddress } = useLiveAddressActions();

  useLiveAddress(userId);

  const defaultAddress = addresses?.find((a) => a.isDefault);
  const addressId = defaultAddress?._id;

  // Extracted logic hook makes UI super lean!
  const {
    items,
    hasHydrated,
    subtotal,
    taxAmount,
    deliveryFee,
    remainingAmount,
    total,
    handleCheckoutIntent,
    isPending,
  } = useCartSummary(addressId);

  // Avoid rendering anything while zustand persists or if empty
  if (!hasHydrated || items.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Delivery Address */}
      {isAuthenticated && (
        <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-lg">
          <CardHeader>
            <CardTitle className="font-semibold text-lg">
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {/* TODO: Implement Delivery Address */}
            {isLoading ? (
              <CardAddressSkeleton />
            ) : addresses?.length > 0 ? (
              <AddressCardsList
                addresses={addresses}
                setOpen={setOpenAddressForm}
                userId={userId}
                updateAddress={updateAddress}
                setOpenAddresses={setOpenAddressSheet}
              />
            ) : (
              <div
                className={cn(
                  "flex items-center gap-2",
                  "justify-center flex-col py-8 text-center border-2 border-dashed border-border rounded-lg",
                )}
              >
                <MapPin className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="font-semibold text-[16px] text-foreground mb-1">
                  No delivery address
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                  Add a delivery address to proceed with checkout
                </p>
                <Button
                  variant={"default"}
                  className="cursor-pointer"
                  onClick={() => setOpenAddressForm(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Address
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border by-6 shadow-lg sticky top-24">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Order Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">
                  Subtotal ({items.length} {items.length > 1 ? "items" : "item"}
                  )
                </span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-semibold text-foreground">
                  {" "}
                  {deliveryFee === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${deliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>

              {remainingAmount > 0 && (
                <div className="bg-blue-50/80 border border-blue-200/60 rounded-lg p-3.5 text-sm animate-pulse-slow">
                  <p className="text-blue-700 font-medium flex items-center gap-2">
                    <span>🚚</span>
                    <span>
                      Add{" "}
                      <strong className="font-bold">
                        ${remainingAmount.toFixed(2)}
                      </strong>{" "}
                      more for FREE delivery!
                    </span>
                  </p>
                </div>
              )}

              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span className="font-semibold">${taxAmount.toFixed(2)}</span>
              </div>

              <Separator className="my-2" />
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary tracking-tight">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              {isAuthenticated ? (
                <div className="bg-accent border border-border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <span className="text-lg">👋</span>
                    </div>
                    <div>
                      <p className="font-semibold text-accent-foreground text-sm">
                        Hello, {userName || "Guest"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Ready to complete your order
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-muted border border-border/50 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0 shadow-sm border border-border/50">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      Sign in Required
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Please sign in to securely checkout
                    </p>
                  </div>
                </div>
              )}
              <Button
                disabled={
                  (isAuthenticated &&
                    (!addresses || addresses?.length === 0)) ||
                  isPending
                }
                className={cn(
                  "relative w-full py-7 text-primary-foreground rounded-xl font-bold text-base shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden cursor-pointer",
                  isAuthenticated
                    ? "bg-primary hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5"
                    : "bg-destructive hover:bg-destructive/70 text-destructive-foreground",
                )}
                onClick={() => handleCheckoutIntent(isAuthenticated)}
              >
                {isAuthenticated && (
                  <span className="absolute inset-0 bg-primary-foreground transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                )}
                <span
                  className={cn(
                    isAuthenticated &&
                      "relative z-10 group-hover:text-primary transition-colors duration-300",
                    "flex items-center justify-center",
                  )}
                >
                  {isAuthenticated ? (
                    <span className="flex items-center justify-center">
                      {isPending
                        ? "Securing Checkout..."
                        : "Proceed to Checkout"}
                      {!isPending && (
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      )}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Lock className="mr-2 h-4 w-4" />
                      Sign in to Checkout
                    </span>
                  )}
                </span>
              </Button>
              {isAuthenticated && (
                <Link href={"user/addresses"}>
                  <Button
                    variant={"outline"}
                    className="w-full border-2 hover:border-primary hover:bg-primary/5 cursor-pointer"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Manage Addresses
                  </Button>
                </Link>
              )}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground/80 bg-muted/30 py-2 rounded-full border border-border/50">
              <Lock className="h-3 w-3" />
              <span>Secure checkout powered by Auth.js</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sheets / Modals */}
      {/* Address Form Sheet */}
      {isAuthenticated && userId && (
        <>
          <AddressSheet
            open={openAddressFrom}
            setOpen={setOpenAddressForm}
            userId={userId}
            onSubmit={async (data) => {
              const res = await createAddress(data);
              return res;
            }}
            loading={creating}
            mode="create"
          />

          {/* Full Addresses List */}
          <FullAddressSheet
            open={openAddressSheet}
            setOpen={setOpenAddressSheet}
            addresses={addresses}
            updateAddress={updateAddress}
            updating={updating}
            creating={creating}
          />
        </>
      )}
    </div>
  );
};

export default CartSummaryWrapper;
