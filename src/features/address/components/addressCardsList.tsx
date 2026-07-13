"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, House, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Address } from "@/../../types/sanityTypes";
import { useAddressStore } from "../store/addressStore";
import { IconsPicker } from "./iconsPicker";
import { AddressCard } from "./addressCard";

interface AddressCardsListProps {
  addresses: Address[];
  setOpen: (open: boolean) => void;
  userId: string | undefined;
  setOpenAddresses: (open: boolean) => void;

  updateAddress: (
    id: string,
    updates: Partial<Address>,
  ) => Promise<{ success: boolean; error: unknown }>;
}

const AddressCardsList = ({
  addresses,
  setOpen,
  setOpenAddresses,
  updateAddress,
}: AddressCardsListProps) => {
  const updating = useAddressStore((state) => state.ui.updatingId);
  const creating = useAddressStore((s) => s.ui.creating);

  // Safe default fallback per AGENTS guardrails
  const safeAddresses = addresses || [];
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
          {safeAddresses.length > 2 && (
            <Button
              variant={"outline"}
              className="cursor-pointer"
              onClick={() => setOpenAddresses(true)}
            >
              <List className="mr-2 h-4 w-4" />
              View All ({safeAddresses.length})
            </Button>
          )}
          <Button
            variant={"outline"}
            className="cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Address
          </Button>
        </div>
        <div className="space-y-3">
          {safeAddresses.slice(0, 2).map((address, index) => (
            <AddressCard
              key={address._id}
              address={address}
              updating={updating === address._id}
              creating={creating}
              variant="compact"
              animationDelay={`${index * 100}ms`}
              onClick={() => {
                if (address.isDefault || updating === address._id) return;
                updateAddress(address._id, { isDefault: true });
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default AddressCardsList;
