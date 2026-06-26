"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface DeliveryPricingTabProps {
  formLogic: {
    deliveryFee: number;
    setDeliveryFee: (deliveryFee: number) => void;
    minimumOrder: number;
    setMinimumOrder: (minimumOrder: number) => void;
    estimatedDeliveryTime: number;
    setEstimatedDeliveryTime: (estimatedDeliveryTime: number) => void;
    isFeatured: boolean;
    setIsFeatured: (isFeatured: boolean) => void;
    order: number;
    setOrder: (order: number) => void;
    isPending: boolean;
  };
}

export function DeliveryPricingTab({ formLogic }: DeliveryPricingTabProps) {
  return (
    <Card className="relative border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="font-semibold text-lg">
          Delivery & Pricing Rules
        </CardTitle>
        <CardDescription>
          Set delivery fees, minimum requirements, and display parameters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="deliveryFee">Delivery Fee ($)</Label>
            <Input
              id="deliveryFee"
              type="number"
              step="0.01"
              value={formLogic.deliveryFee}
              onChange={(e) => formLogic.setDeliveryFee(Number(e.target.value))}
              required
              disabled={formLogic.isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="minimumOrder">Minimum Order Amount ($)</Label>
            <Input
              id="minimumOrder"
              type="number"
              step="0.01"
              value={formLogic.minimumOrder}
              onChange={(e) =>
                formLogic.setMinimumOrder(Number(e.target.value))
              }
              required
              disabled={formLogic.isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deliveryTime">Est. Delivery Time (minutes)</Label>
            <Input
              id="deliveryTime"
              type="number"
              value={formLogic.estimatedDeliveryTime}
              onChange={(e) =>
                formLogic.setEstimatedDeliveryTime(Number(e.target.value))
              }
              required
              disabled={formLogic.isPending}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 items-center pt-2">
          {/* Featured switcher */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50/50">
            <div>
              <Label className="font-semibold text-sm">
                Featured Restaurant
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Showcase this restaurant on the home catalog page
              </p>
            </div>
            <Switch
              checked={formLogic.isFeatured}
              onCheckedChange={formLogic.setIsFeatured}
              disabled={formLogic.isPending}
            />
          </div>

          {/* Display Sorting Order */}
          <div className="space-y-1.5 p-4 border rounded-lg bg-slate-50/50">
            <Label htmlFor="displayOrder" className="font-semibold text-sm">
              Display Sorting Order
            </Label>
            <Input
              id="displayOrder"
              type="number"
              value={formLogic.order}
              onChange={(e) => formLogic.setOrder(Number(e.target.value))}
              className="h-9 mt-1"
              disabled={formLogic.isPending}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
