import React from "react";

function CartItemsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-32 w-full bg-muted/40 rounded-xl border border-border/20"
        />
      ))}
      <div className="flex gap-4 pt-4 mt-4">
        <div className="h-14 w-full bg-muted/40 rounded-xl" />
        <div className="h-14 w-full bg-muted/40 rounded-xl" />
      </div>
    </div>
  );
}

export default CartItemsSkeleton;
