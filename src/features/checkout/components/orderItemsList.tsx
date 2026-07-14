"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container, Utensils } from "lucide-react";
import Image from "next/image";
import { CartItem } from "@/stores/cart/cartStore";

interface OrderItemsListProps {
  items: CartItem[];
  isHydrated: boolean;
}

export const OrderItemsList = ({ items, isHydrated }: OrderItemsListProps) => {
  if (!isHydrated) {
    return (
      <Card className="flex flex-col gap-6! drop-shadow-xl">
        <CardHeader className="grid-rows-[auto_auto]">
          <CardTitle className="leading-none font-semibold flex items-center gap-2 animate-pulse">
            <div className="h-5 w-5 rounded-full bg-muted" />
            <div className="h-5 w-40 rounded-md bg-muted"></div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted relative shrink-0"></div>
                <div className="flex-1 min-w-0 bg-muted h-5 rounded-lg"></div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm bg-muted h-3 w-10 rounded-lg mb-1"></p>
                  <p className="text-xs text-muted-foreground bg-muted h-3 w-10 rounded-lg"></p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const safeItems = items || [];

  return (
    <Card className="flex flex-col gap-6! drop-shadow-xl">
      <CardHeader className="grid-rows-[auto_auto]">
        <CardTitle className="leading-none font-semibold flex items-center gap-2">
          <Container className="h-5 w-5 text-primary " />
          Order Items ({safeItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="space-y-3">
          {safeItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted relative shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Utensils className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                {(item.size || item.variety) && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.size} {item.variety && `· ${item.variety}`}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-sm">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
