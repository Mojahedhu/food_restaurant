import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Check, House } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Address } from "@/../types/sanityTypes";
import { IconsPicker } from "./iconsPicker";
import { EmptyAddressState } from "./emptyAddressState";
import { AddressCard } from "./addressCard";
interface FullAddressSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  addresses: Address[];
  updateAddress: (
    id: string,
    updates: Partial<Address>,
  ) => Promise<{ success: boolean; error: unknown }>;
  updating: string | null;
  creating: boolean;
}
const FullAddressSheet = ({
  open,
  setOpen,
  addresses,
  updateAddress,
  updating,
  creating,
}: FullAddressSheetProps) => {
  // Safe default fallback per AGENTS guardrails
  const safeAddresses = addresses || [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full p-6 sm:max-w-xl md:max-w-2xl lg:max-w-4xl overflow-y-auto"
      >
        <SheetHeader className="space-y-2 text-center sm:text-left p-0">
          <SheetTitle className="text-lg font-semibold text-foreground">
            Select Delivery Address
          </SheetTitle>
          <SheetDescription>
            Choose from all your saved addresses
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {safeAddresses.length === 0 ? (
            <EmptyAddressState />
          ) : (
            safeAddresses.map((address) => (
              <AddressCard
                key={address._id}
                address={address}
                updating={updating === address._id}
                creating={creating}
                variant="full"
                onClick={() => {
                  if (address.isDefault || updating === address._id) return;
                  updateAddress(address._id, { isDefault: true });
                  setOpen(false);
                }}
              />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FullAddressSheet;
