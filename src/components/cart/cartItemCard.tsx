"use client";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CartItem } from "@/stores/cart/cartStore";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) {
  const isMinQuantity = item.quantity <= 1;
  const itemTotal = (item.price || 0) * (item.quantity || 1);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 w-full overflow-hidden border-border/50">
      <CardContent className="p-4 lg:p-6">
        <div className="flex gap-4 sm:gap-6">
          {/* Product Image */}
          <Link href={`/food/${item.slug}`} className="shrink-0 group block">
            <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-xl overflow-hidden bg-muted relative border border-border/50">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name || "Food Item"}
                  fill
                  sizes="(max-width: 1024px) 96px, 112px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              ) : (
                <div className="w-full h-full flex justify-center items-center bg-gray-50">
                  <Package className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
            </div>
          </Link>

          {/* Item Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/food/${item.slug}`}
                  className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm inline-block"
                >
                  <h3 className="font-bold text-lg text-foreground line-clamp-2 leading-tight">
                    {item.name || "Unknown Item"}
                  </h3>
                </Link>

                <div className="mt-2 space-y-1.5">
                  {item.category && (
                    <Badge variant="secondary" className="text-xs font-medium">
                      {item.category}
                    </Badge>
                  )}
                  {item.size && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <span className="font-medium text-foreground/80">
                        Size:
                      </span>{" "}
                      {item.size}
                    </p>
                  )}
                  {item.variety && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <span className="font-medium text-foreground/80">
                        Variety:
                      </span>{" "}
                      {item.variety}
                    </p>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(item.id)}
                className="text-muted-foreground bg-muted/70 cursor-pointer hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8"
                aria-label={`Remove ${item.name} from cart`}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>

            {/* Price and Quantity Controls */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-4 gap-4">
              <div className="flex items-center gap-1 bg-muted/50 border border-border/50 rounded-full p-1 self-start sm:self-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={isMinQuantity}
                  className="h-7 w-7 rounded-full bg-background shadow-sm disabled:opacity-50 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span
                  className="font-semibold text-foreground w-8 text-center text-sm"
                  aria-live="polite"
                >
                  {item.quantity || 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="h-7 w-7 rounded-full bg-background shadow-sm hover:text-primary cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                  ${itemTotal.toFixed(2)}
                </p>
                {(item.quantity || 1) > 1 && (
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    ${(item.price || 0).toFixed(2)} each
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
