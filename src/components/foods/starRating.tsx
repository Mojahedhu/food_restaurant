"use client";

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

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }).map((_, index) => {
          const fillPercentage = Math.max(
            0,
            Math.min(100, (rating - index) * 100),
          );

          return (
            <div key={index} className="relative">
              {/* Gray background */}
              <Star
                className={cn(
                  sizeClasses[size],
                  "text-gray-600 dark:text-gray-600",
                )}
              />

              {/* Yellow fill */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  width: `${fillPercentage}%`,
                }}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    "fill-amber-500 text-amber-500",
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>

      {showValue && (
        <span
          className={cn(
            "text-muted-foreground font-medium",
            textSizeClasses[size],
          )}
        >
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};
