import { cn } from "@/lib/utils";

interface Props {
  amount: number | undefined;
  className?: string;
}

export const PriceFormatter = ({ amount, className }: Props) => {
  const formattedPrice = new Number(amount).toLocaleString("en-US", {
    currency: "USD",
    style: "currency",
    minimumFractionDigits: 2,
  });

  return (
    <span className={cn("text-base font-semibold text-primary", className)}>
      {formattedPrice}
    </span>
  );
};
