"use client";
import React, { useEffect } from "react";
import { useCartStore } from "../../../stores/cartStore";
import {
  Minus,
  Package,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";
import { Badge } from "../ui/badge";

import ClearAlertDialog from "./clearAlertDialog";

const CartItems = () => {
  const [mounted, setMounted] = React.useState(false);
  const [showClearDialog, setShowClearDialog] = React.useState(false);

  const items = useCartStore((state) => state.items);
  console.log(items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-pulse text-center">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 border-2 border-dashed drop-shadow-lg">
        <CardContent className="px-6 flex flex-col items-center justify-center py-20">
          <div className="flex justify-center items-center w-32 h-32 rounded-full bg-linear-to-br from-primary/10 to-primary/5 mb-6 shadow-inner">
            <ShoppingBag className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            Looks like you haven&apos;t added any delicious items to your cart
            yet. Start exploring our menu!
          </p>
          <Link href="/menu">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg
              hover:shadow-xl group relative overflow-hidden px-4"
            >
              <span className="absolute inset-0 bg-primary-foreground transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center justify-center group-hover:text-primary transition-colors use-effect">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Browse Menu
              </span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items?.map((item) => (
        <Card
          key={item.id}
          className="shadow-md hover:shadow-lg w-full hover-effect"
        >
          <CardContent className="p-4 lg:p-6">
            <div className="flex gap-4">
              <Link href={`/food/${item.slug}`} className="shrink-0 group">
                <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-xl overflow-hidden bg-muted relative">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 1024px) 96px, 112px"
                      className="object-cover group-hover:scale-110 transition-transform duration-300 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex justify-center items-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </Link>
              {/* Item details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      href={`/food/${item.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      <h3 className="font-bold text-lg text-foreground line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                    {item.category && (
                      <Badge variant={"secondary"} className="mt-2 text-sm">
                        {item.category}
                      </Badge>
                    )}
                    {item.size && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Size: {item.size}
                      </p>
                    )}
                    {item.variety && (
                      <p className="text-sm text-muted-foreground">
                        Variety: {item.variety}
                      </p>
                    )}
                  </div>
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive/10 shrink-0"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                {/* Price and Quantity */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3 bg-muted rounded-full p-1">
                    <Button
                      variant={"ghost"}
                      size={"icon"}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-8 w-8 rounded-full bg-background"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-semibold text-foreground  w-8 text-center">
                      {item.quantity}
                    </span>
                    <div>
                      <Button
                        variant={"outline"}
                        size={"icon"}
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="h-8 w-8 rounded-full bg-background"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">
                        {item.price.toFixed(2)} each
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Link href={"/menu"} className="flex-1">
          <Button
            size={"lg"}
            variant={"outline"}
            className="w-full border-2 hover:border-primary group relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center justify-center group-hover:text-primary-foreground transition-colors duration-300">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </span>
          </Button>
        </Link>
        <Button
          size={"lg"}
          variant={"outline"}
          onClick={() => setShowClearDialog(true)}
          className="flex-1 text-destructive border-destructive/50 hover:border-destructive group relative overflow-hidden"
        >
          <span className="absolute inset-0 bg-destructive transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
          <span className="relative z-10 flex items-center justify-center group-hover:text-white transition-colors duration-300">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </span>
        </Button>
      </div>

      <ClearAlertDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onClearCart={clearCart}
        itemsLength={items.length}
      />
    </div>
  );
};

export default CartItems;
