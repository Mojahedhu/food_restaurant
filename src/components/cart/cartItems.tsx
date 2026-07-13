"use client";
import { useState } from "react";
import { useCartStore } from "../../stores/cart/cartStore";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";

import ClearAlertDialog from "./clearAlertDialog";
import CartItemsSkeleton from "./skeleton/cart-items-skeleton";
import CartItemCard from "./cartItemCard";

const CartItems = () => {
  // const [mounted, setMounted] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const hasHydrated = useCartStore((state) => state._hasHydrated);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  // Safe hydration check using a stable skeleton to prevent layout shift (CLS)
  if (!hasHydrated) {
    return <CartItemsSkeleton />;
  }

  // Empty State
  if (!items || items.length === 0) {
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
    <div className="space-y-5">
      <ul className="space-y-4">
        {/* List rendered using strict modular component */}
        {items?.map((item, index) => (
          <li
            key={item.id}
            className="animate-in zoom-in-95 fade-in duration-500 fill-mode-both"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <CartItemCard
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          </li>
        ))}
      </ul>
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Link href={"/menu"} className="flex-1">
          <Button
            size={"lg"}
            variant={"outline"}
            className="w-full border-2 hover:border-primary group relative overflow-hidden cursor-pointer"
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
          className="flex-1 text-destructive border-destructive/50 hover:border-destructive group relative overflow-hidden cursor-pointer"
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
