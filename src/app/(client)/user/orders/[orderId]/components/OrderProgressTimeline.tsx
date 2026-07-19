import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BadgeCheck,
  Bike,
  ChefHat,
  Clock3,
  PackageCheck,
  X,
} from "lucide-react";
import { OrderSummary } from "@/../types/sanityTypes";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TimelineProps {
  allStatuses: OrderSummary["status"][];
  currentStatus: OrderSummary["status"];
  currentProgress: number;
}

const steps = [
  () => <Clock3 className="h-5 w-5" />,

  () => <BadgeCheck className="h-5 w-5" />,

  () => <ChefHat className="h-5 w-5" />,

  () => <Bike className="h-5 w-5" />,

  () => <PackageCheck className="h-5 w-5" />,

  () => <X className="h-5 w-5 border-2 rounded-full border-white" />,
];

export default function OrderProgressTimeline({
  allStatuses,
  currentStatus,
  currentProgress,
}: TimelineProps) {
  const active = currentStatus?.value.current;
  return (
    <Card className="shadow-sm border-border/60 overflow-hidden">
      {/* Header */}
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-zinc-900">
          Order Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 sm:p-10">
        <div className="relative">
          {/* line background */}
          <div className="absolute left-[50%] sm:left-0 top-0 sm:top-5 h-full sm:h-1 w-1 sm:w-full bg-muted -translate-x-1/2 sm:translate-x-0 rounded-full overflow-hidden" />
          {/* progress fill */}
          <div
            className={cn(
              "absolute left-[50%] sm:left-0 top-0 sm:top-5 w-1 sm:h-1 -translate-x-1/2 sm:translate-x-0 transition-[height,width] duration-700 ease-in-out shadow-[0_0_10px_rgba(var(--primary),0.5)] max-sm:h-(--progress) sm:w-(--progress)",
              active !== "cancelled" ? "bg-primary" : "bg-destructive",
            )}
            style={
              { "--progress": `${currentProgress}%` } as React.CSSProperties
            }
          />
          {/* Steps */}
          <div className="relative flex flex-col sm:flex-row justify-between gap-8 sm:gap-0 z-10">
            {allStatuses.map((status, index) => {
              const isCompleted =
                (status?.order || 0) <= (currentStatus?.order || 0);
              const isCurrent =
                (status?.order || 0) === (currentStatus?.order || 0);

              return (
                // step container
                <div
                  key={status?._id || `status-${index}`}
                  className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-3 flex-1 sm:text-center"
                >
                  {/* icon container */}
                  <div
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 transition-colors duration-700 animate-in fade-in zoom-in-70 fill-mode-both ease-in-out
                    ${
                      isCompleted
                        ? `${
                            active !== "cancelled"
                              ? "bg-primary text-primary-foreground"
                              : "bg-destructive text-destructive-foreground"
                          } border-background shadow-md`
                        : "bg-muted border-background text-muted-foreground"
                    }
                    ${
                      isCurrent
                        ? `ring-4 scale-110
                         ${
                           active !== "cancelled"
                             ? "ring-primary/20"
                             : "ring-destructive/20"
                         }`
                        : ""
                    }`}
                    style={{
                      animationDelay: `${(1 + index) * 500}ms`,
                    }}
                  >
                    {/* active pulse animation*/}
                    {isCurrent && active !== "delivered" && (
                      <span
                        className={cn(
                          "absolute z-50 inset-0 rounded-full animate-status-pulse",
                          active !== "cancelled"
                            ? "bg-primary"
                            : "bg-destructive",
                        )}
                      />
                    )}
                    {/* step icon */}
                    {isCompleted ? (
                      <>{steps[index]()}</>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-current opacity-50" />
                    )}
                  </div>
                  <div
                    className="flex flex-col sm:items-center animate-in slide-in-from-bottom-4 fade-in zoom-in-90 fill-mode-both transition-all duration-700 ease-in-out"
                    style={{
                      animationDelay: `${(1 + index) * 500}ms`,
                    }}
                  >
                    {/* step title */}
                    <span
                      className={`text-sm font-bold ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {status?.title || "N/A"}
                    </span>

                    {/* step description */}
                    {status?.description && (
                      <span className="text-xs text-muted-foreground font-medium hidden sm:block max-w-[120px]">
                        {status.description}
                      </span>
                    )}
                    {/* step active indicator */}
                    {isCurrent && (
                      <div className="pt-4">
                        <Badge
                          className={cn(
                            "animate-in fade-in-0 fill-mode-both transition-all duration-700 ease-in-out",
                            active !== "cancelled"
                              ? "text-primary"
                              : "text-destructive bg-destructive/10",
                          )}
                          variant={"secondary"}
                          style={{ animationDelay: `${5.5 * 500}ms` }}
                        >
                          {index < steps.length - 2
                            ? "In Progress"
                            : active !== "cancelled"
                              ? "Delivered"
                              : "Cancelled"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
