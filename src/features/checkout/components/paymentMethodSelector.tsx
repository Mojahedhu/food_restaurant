"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, CreditCard, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentMethod = "online" | "cod";

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export const PaymentMethodSelector = ({
  selected,
  onSelect,
}: PaymentMethodSelectorProps) => {
  return (
    <Card className="flex flex-col gap-6! drop-shadow-xl">
      <CardHeader className="grid-rows-[auto_auto]">
        <CardTitle className="leading-none font-semibold flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary " />
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="space-y-3">
          <button
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer",
              selected === "online"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50",
            )}
            onClick={() => onSelect("online")}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold text-foreground truncate">
                Online Payment (Stripe)
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Pay securely with credit/debit online
              </p>
            </div>
            {selected === "online" && (
              <CheckCircle className="h-5 w-5 text-primary shrink-0" />
            )}
          </button>
          <button
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer",
              selected === "cod"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50",
            )}
            onClick={() => onSelect("cod")}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold text-foreground truncate">
                Cash on Delivery
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Pay when you receive your order
              </p>
            </div>
            {selected === "cod" && (
              <CheckCircle className="h-5 w-5 text-primary shrink-0" />
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
