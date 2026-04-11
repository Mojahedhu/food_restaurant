"use client";
import React, { useState } from "react";
import { useCartStore } from "../../../stores/cartStore";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Address } from "../../../sanity.types";
import AddressSheet from "@/features/address/components/addressSheet";

interface CartSummaryWrapperProps {
  isAuthenticated: boolean;
  userName: string | undefined;
  userEmail: string | undefined;
  hasAddresses: boolean;
  userId: string | undefined;
  address: Address[];
}

const CartSummaryWrapper = ({
  isAuthenticated,
  userName,
  userEmail,
  hasAddresses,
  userId,
  address,
}: CartSummaryWrapperProps) => {
  const [open, setOpen] = useState(false);
  const items = useCartStore((state) => state.items);

  if (items.length === 0) {
    return null;
  }
  return (
    <div className="space-y-6">
      {/* Delivery Address */}
      <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-lg">
        <CardHeader>
          <CardTitle className="font-semibold text-lg">
            Delivery Address
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          {/* TODO: Implement Delivery Address */}
          {address.length > 0 ? (
            <></>
          ) : (
            <div
              className={cn(
                "flex items-center gap-2",
                address.length
                  ? "justify-end"
                  : "justify-center flex-col py-8 text-center border-2 border-dashed border-border rounded-lg",
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
                variant={address.length === 0 ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Address
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <AddressSheet open={open} setOpen={setOpen} userId={userId!} />
    </div>
  );
};

export default CartSummaryWrapper;
