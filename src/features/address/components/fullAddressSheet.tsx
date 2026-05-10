import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Check, House } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Address } from "../../../../types/sanityTypes";
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
          {addresses.map((address) => (
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
                setOpen(false);
              }}
            >
              <CardContent className={cn(address.isDefault ? "p-4" : "p-6")}>
                {(updating === address._id || creating) && (
                  <Badge
                    variant={"outline"}
                    className="text-xs ml-auto shrink-0 absolute top-2 right-2"
                  >
                    {creating ? "Creating..." : "Updating..."}
                  </Badge>
                )}
                <div className="flex items-start gap-3">
                  {address.type === "home" ? (
                    <div className="shrink-0">
                      <House className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="shrink-0">
                      <Building className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm capitalize text-[14px]">
                        {address.type}
                      </span>
                      {address.isDefault && (
                        <Badge variant={"outline"} className="text-xs">
                          Default
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        • {address.label}
                      </span>
                    </div>
                    <p className="text-xs text-foreground text-[14px]">
                      {address.city}, {address.apartment}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {address.country}, {address.state}, {address.street}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {address.phone}
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
      </SheetContent>
    </Sheet>
  );
};

export default FullAddressSheet;
