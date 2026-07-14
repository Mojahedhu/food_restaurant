"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Address } from "@/../types/sanityTypes";

interface DeliveryAddressCardProps {
  address?: Address;
  isLoading: boolean;
}

export const DeliveryAddressCard = ({
  address,
  isLoading,
}: DeliveryAddressCardProps) => {
  if (isLoading) {
    return (
      <Card className="flex flex-col gap-6! drop-shadow-xl">
        <CardHeader className="grid-rows-[auto_auto]">
          <CardTitle className="leading-none font-semibold flex items-center gap-2 animate-pulse">
            <div className="h-5 w-5 rounded-full bg-muted"></div>
            <div className="h-5 w-20 rounded-md bg-muted"></div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 animate-pulse">
          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg h-24"></div>
        </CardContent>
      </Card>
    );
  }

  if (!address) {
    return (
      <Card className="flex flex-col gap-6! drop-shadow-xl border-destructive/50">
        <CardContent className="px-6 py-8 text-center">
          <MapPin className="h-8 w-8 text-destructive mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">Address not found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please select a valid delivery address.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-6! drop-shadow-xl">
      <CardHeader className="grid-rows-[auto_auto]">
        <CardTitle className="leading-none font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary " />
          Delivery Address
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
          <div className="shrink-0">
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold capitalize text-[16px]">
                {address.type || "Other"}
              </span>
              {address.label && (
                <Badge variant={"secondary"}>{address.label}</Badge>
              )}
            </div>
            <p className="text-sm text-foreground">{address.country}</p>
            <p className="text-sm text-muted-foreground">{address.zipCode}</p>
            <p className="text-sm text-muted-foreground">
              {address.state}, {address.city}, {address.street}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Phone: {address.phone}
            </p>
            {address.instructions && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                “{address.instructions}”
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
