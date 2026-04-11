import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

export const StarRating = ({
  rating,
  maxRating = 5,
  size = "md",
  showValue = true,
  className,
}: StarRatingProps) => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  } as const;

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  } as const;

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }).map((_, index) => {
          const isFilled = index < fullStars;
          const isHalf = index === fullStars && hasHalfStar;
          const isEmpty = index >= fullStars + (hasHalfStar ? 1 : 0);

          return (
            <div key={index} className="relative">
              {/* Background star (gray) */}
              {!isFilled && !isHalf && isEmpty && (
                <Star
                  className={cn(
                    sizeClasses[size],
                    "text-gray-500 dark:text-gray-700",
                  )}
                />
              )}
              {/* Filled star */}
              {(isFilled || isHalf) && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    width: isHalf ? "50%" : "100%",
                  }}
                >
                  <Star
                    className={cn(
                      sizeClasses[size],
                      "text-yellow-500 fill-yellow-500",
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
        {showValue && (
          <span>
            <span
              className={cn(
                "text-muted-foreground font-medium",
                textSizeClasses[size],
              )}
            >
              {rating.toFixed(1)}
            </span>
          </span>
        )}
      </div>
    </div>
  );
};
