"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock3, BadgeCheck, ChefHat, Bike, PackageCheck } from "lucide-react";

export type Status =
  | "placed"
  | "confirmed"
  | "preparing"
  | "delivery"
  | "delivered";

const steps = [
  {
    key: "placed",
    title: "Order Placed",
    desc: "We received your order",
    icon: Clock3,
  },
  {
    key: "confirmed",
    title: "Confirmed",
    desc: "Restaurant accepted order",
    icon: BadgeCheck,
  },
  {
    key: "preparing",
    title: "Preparing",
    desc: "Your food is being prepared",
    icon: ChefHat,
  },
  {
    key: "delivery",
    title: "Out for Delivery",
    desc: "Driver is on the way",
    icon: Bike,
  },
  {
    key: "delivered",
    title: "Delivered",
    desc: "Enjoy your meal!",
    icon: PackageCheck,
  },
];
export const statusOrder: Status[] = [
  "placed",
  "confirmed",
  "preparing",
  "delivery",
  "delivered",
];

export default function OrderStatus({
  currentStatus = "preparing",
}: {
  currentStatus?: Status;
}) {
  const activeIndex = statusOrder.indexOf(currentStatus);

  return (
    <Card className="w-full rounded-2xl border bg-card drop-shadow-lg">
      {/* Header */}
      <CardHeader className="mb-10 flex items-center justify-between">
        <CardTitle className="text-2xl font-semibold text-zinc-900">
          Order Status
        </CardTitle>
      </CardHeader>

      {/* Desktop */}
      <CardContent>
        <div className="hidden md:block">
          <div className="relative">
            {/* line background */}
            <div className="absolute top-7 left-0 right-0 h-[3px] bg-zinc-200" />

            {/* progress fill */}
            <div
              className="absolute top-7 left-0 h-[3px] bg-primary transition-all duration-700 ease-out"
              style={{
                width: `${(activeIndex / (steps.length - 1)) * 100}%`,
              }}
            />

            <div className="relative grid grid-cols-5 gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;

                const completed = index < activeIndex;
                const active = index === activeIndex;

                return (
                  <div
                    key={step.key}
                    className="flex flex-col items-center text-center"
                  >
                    {/* circle */}
                    <div
                      className="relative mb-4 flex h-14 w-14 items-center justify-center animate-step-in"
                      style={{
                        animationDelay: `${(1 + index) * 500}ms`,
                      }}
                    >
                      {/* Active pulse */}
                      {active && currentStatus !== "delivered" && (
                        <span className="absolute z-50 inset-0 rounded-full bg-primary animate-status-pulse" />
                      )}

                      <div
                        className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-300
                      ${
                        completed || active
                          ? "border-primary bg-primary text-white shadow-md"
                          : "border-zinc-300 bg-white text-zinc-500"
                      }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    {/* text */}
                    <div
                      className={`animate-in duration-500 slide-in-from-bottom-5 fade-in-0 fill-mode-backwards`}
                      style={{
                        animationDelay: `${(1.8 + index) * 500}ms`,
                      }}
                    >
                      <h3
                        className={`text-sm font-semibold ${
                          active || completed ? "text-primary" : "text-zinc-500"
                        }`}
                      >
                        {step.title}
                      </h3>

                      <p className="my-1 text-xs text-zinc-500 max-w-[120px]">
                        {step.desc}
                      </p>
                    </div>
                    {active && (
                      <Badge
                        className="text-primary animate-in fade-in-0 fill-mode-backwards"
                        variant={"secondary"}
                        style={{ animationDelay: `${5.5 * 500}ms` }}
                      >
                        {index < steps.length - 1 ? "In Progress" : "Delivered"}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="space-y-5 md:hidden">
          {steps.map((step, index) => {
            const Icon = step.icon;

            const completed = index < activeIndex;
            const active = index === activeIndex;

            return (
              <div key={step.key} className="flex gap-4">
                {/* left */}
                <div className="flex flex-col items-center">
                  <div className="relative flex h-12 w-12 items-center justify-center">
                    {active && currentStatus !== "delivered" && (
                      <span className="absolute inset-0 rounded-full bg-primary animate-status-pulse" />
                    )}

                    <div
                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 animate-step-in
                    ${
                      completed || active
                        ? "border-primary bg-primary text-white"
                        : "border-zinc-300 bg-white text-zinc-500"
                    }`}
                      style={{ animationDelay: `${(1.1 + index) * 500}ms` }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  {index !== steps.length - 1 && (
                    <div
                      className={`mt-2 h-10 w-[3px] ${
                        completed ? "bg-primary" : "bg-zinc-200"
                      }`}
                    />
                  )}
                </div>

                {/* right */}
                <div
                  className="pt-1 animate-in fade-in-0 slide-in-from-right-20 fill-mode-backwards"
                  style={{ animationDelay: `${(1.8 + index) * 500}ms` }}
                >
                  <h3 className="text-sm font-semibold text-primary">
                    {step.title}
                  </h3>

                  <p className="text-xs text-zinc-500 pb-1">{step.desc}</p>
                  {active && (
                    <Badge
                      className="animate-in fade-in-0 fill-mode-backwards"
                      style={{ animationDelay: `${6.8 * 500}ms` }}
                      variant={"secondary"}
                    >
                      {index < steps.length - 1 ? "In Progress" : "Delivered"}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
