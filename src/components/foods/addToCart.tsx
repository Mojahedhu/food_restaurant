"use client";
import { Check, ShoppingCart } from "lucide-react";
import { FoodWithDetails } from "../../../types/sanityTypes";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useCartStore } from "../../stores/cartStore";
import { urlFor } from "@/sanity/lib/image";
import { toast } from "sonner";

interface props {
  food: FoodWithDetails;
  className?: string;
  variant?: "default" | "icon";
}

const AddToCart = ({ food, className, variant = "default" }: props) => {
  const addItem = useCartStore((state) => state.addItem);

  const [isAdded, setIsAdded] = useState(false);
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // create unique ID for cart item
    const cartItemId = `${food._id}`;
    addItem({
      id: cartItemId,
      foodId: food._id,
      name: food.name || "Unknown Item",
      slug: food.slug || "",
      price: food.basePrice || 0,
      image: food.images?.[0] ? urlFor(food.images[0]).url() : "",
      category: food.category?.name,
      size: food.size || "",
      variety: food.variety || "",
    });
    toast.success("Item added to cart", {
      description: `${food.name} has been added to your cart.`,
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };
  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdded}
      className={cn(
        `w-full border px-10 py-2 relative overflow-hidden group/button transition-all duration-300 rounded-md`,
        `${isAdded ? "border-green-500 bg-green-500 cursor-default" : "border-primary/70 hover:border-primary cursor-pointer"}`,
        `${className}`,
      )}
    >
      <span
        className={cn(
          `absolute inset-0 bg-primary transition-transform duration-300 ease-out ${
            isAdded
              ? "translate-y-0"
              : "-translate-y-full group-hover/button:translate-y-0"
          }`,
        )}
      ></span>
      <span
        className={`relative z-10 transition-all duration-300 font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 ${isAdded ? "text-white scale-105" : "text-primary group-hover/button:text-primary-foreground"}`}
      >
        {isAdded ? (
          <>
            <Check className="h-4 w-4 animate-in zoom-in duration-300" />
            Added to cart
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Add to cart
          </>
        )}
      </span>
    </button>
  );
};

export default AddToCart;
