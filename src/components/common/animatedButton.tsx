import { cn } from "@/lib/utils";
import Link from "next/link";

interface AnimatedButtonProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
  direction?: "left-to-right" | "top-to-bottom";
  variant?: "filled" | "outline";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

const AnimatedButton = ({
  href,
  children,
  className,
  direction = "left-to-right",
  variant = "filled",
  onClick,
  type = "button",
  disabled = false,
  size = "md",
}: AnimatedButtonProps) => {
  const directionClass =
    direction === "top-to-bottom" ? "-translate-y-full" : "-translate-x-full";
  const hoverClass =
    direction === "top-to-bottom"
      ? "group-hover/button:translate-y-0"
      : "group-hover/button:translate-x-0";

  // Size variant
  const sizeClasses = {
    sm: "px-6 py-2 text-sm",
    md: "px-10 py-3 text-base",
    lg: "px-12 py-4 text-lg",
  };

  // Variant sizeClasses
  const variantClasses = {
    filled:
      "border border-primary bg-primary text-primary-foreground hover:border-primary",
    outline:
      "border border-primary/70 bg-transparent text-primary hover:border-primary",
  };

  // Text color animation based on variant
  const bgAnimationClass =
    variant === "filled"
      ? "bg-primary-foreground" // reverse animation for filled
      : "bg-primary"; // Normal animation for outline

  // Text color animation based on variant
  const textColorClass =
    variant === "filled"
      ? "group-hover/button:text-primary" // Filled button text becomes primary
      : "group-hover/button:text-primary-foreground"; // Outline button text becomes white

  const baseClasses = cn(
    "inline-flex items-center justify-center font-bold rounded-full relative overflow-hidden transition-all duration-300 group/button",
    sizeClasses[size],
    variantClasses[variant],
    disabled && "opacity-50 cursor-not-allowed",
    className,
  );

  const content = (
    <>
      <span
        className={cn(
          "absolute inset-0 transition-transform duration-300 ease-out",
          bgAnimationClass,
          directionClass,
          hoverClass,
          direction === "top-to-bottom" ? "rounded-full" : "",
        )}
      />
      <span
        className={cn(
          "relative z-10 transition-colors duration-300 flex items-center gap-2",
          textColorClass,
        )}
      >
        {children}
      </span>
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={baseClasses} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
};

export default AnimatedButton;
