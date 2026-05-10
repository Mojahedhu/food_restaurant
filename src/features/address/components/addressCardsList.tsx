"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, House, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Address } from "../../../../types/sanityTypes";
import { useAddressStore } from "../store/addressStore";

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
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
          {addresses.length > 2 && (
            <Button
              variant={"outline"}
              className="cursor-pointer"
              onClick={() => setOpenAddresses(true)}
            >
              <List className="mr-2 h-4 w-4" />
              View All ({addresses.length})
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
          {addresses.slice(0, 2).map((address) => (
            <Card
              className={cn(
                "text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm hover:border-primary cursor-pointer transition-all",
                address.isDefault && "border-primary bg-primary/5",
                (updating === address._id || creating) && "opacity-50 relative",
              )}
              key={address._id}
              onClick={() => {
                if (address.isDefault || updating === address._id) return;
                updateAddress(address._id, { isDefault: true });
              }}
            >
              <CardContent className="p-3">
                {(updating === address._id || creating) && (
                  <Badge
                    variant={"outline"}
                    className="text-xs ml-auto shrink-0 absolute top-2 right-2"
                  >
                    {creating ? "Creating..." : "Updating..."}
                  </Badge>
                )}
                <div className="flex items-center gap-2">
                  <div className="shrink-0">
                    <House className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="font-medium capitalize shrink-0">
                        {address.type}
                      </span>
                      <span className="text-muted-foreground shrink-0">•</span>
                      <span className="text-muted-foreground shrink-0">
                        {address.city}
                      </span>
                      {address.isDefault && (
                        <Badge
                          variant={"outline"}
                          className="text-xs ml-auto shrink-0"
                        >
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {address.type}, {address.state}, {address.street},{" "}
                      {address.city}
                    </p>
                  </div>
                  {address.isDefault && (
                    <div className="shrink-0">
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default AddressCardsList;
