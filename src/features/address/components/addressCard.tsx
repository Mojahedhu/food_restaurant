import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, House } from "lucide-react";
import { Address } from "@/../../types/sanityTypes";
import { IconsPicker } from "./iconsPicker";

interface AddressCardProps {
  address: Address;
  updating?: boolean;
  creating?: boolean;
  onClick: () => void;
  variant?: "compact" | "full";
  animationDelay?: string;
}

export const AddressCard = ({
  address,
  updating = false,
  creating = false,
  onClick,
  variant = "compact",
  animationDelay,
}: AddressCardProps) => {
  const isCompact = variant === "compact";

  return (
    <Card
      className={cn(
        "text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm hover:border-primary cursor-pointer transition-all",
        isCompact &&
          "animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-500",
        address.isDefault && "border-primary bg-primary/5",
        (updating || creating) && "opacity-50 relative",
      )}
      style={animationDelay ? { animationDelay } : undefined}
      onClick={onClick}
    >
      <CardContent
        className={cn(isCompact ? "p-3" : address.isDefault ? "p-4" : "p-6")}
      >
        {(updating || creating) && (
          <Badge
            variant={"outline"}
            className="text-xs ml-auto shrink-0 absolute top-2 right-2"
          >
            {creating ? "Creating..." : "Updating..."}
          </Badge>
        )}

        <div
          className={cn(
            "flex",
            isCompact ? "items-center gap-2" : "items-start gap-3",
          )}
        >
          {address.type ? (
            <IconsPicker type={address.type} />
          ) : (
            <div className="shrink-0">
              <House
                className={cn(
                  "text-muted-foreground",
                  isCompact ? "h-4 w-4" : "h-5 w-5",
                )}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {isCompact ? (
              <>
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
              </>
            ) : (
              <>
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
              </>
            )}
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
  );
};
