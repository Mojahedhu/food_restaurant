"use client";

import { Badge } from "@/components/ui/badge";

interface OpeningScheduleProps {
  schedule: {
    day: string;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  };
}

export default function OpeningSchedule({ schedule }: OpeningScheduleProps) {
  const today = new Date();
  const day = today
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const isToday = schedule.day === day;

  const status = schedule.isClosed ? (
    <Badge
      variant="destructive"
      className="px-1.5 py-0 border-destructive/50 text-[10px] text-destructive"
    >
      Closed
    </Badge>
  ) : (
    <Badge
      variant="secondary"
      className="px-1.5 py-0 border-primary/50 text-primary text-[10px]"
    >
      Open
    </Badge>
  );

  return (
    <div
      className={`flex justify-between text-sm p-2 rounded-md border transition-colors ${
        isToday
          ? "bg-primary/10 border-primary/20 shadow-sm"
          : "bg-muted/10 border-border/40"
      } font-medium`}
    >
      <span className="capitalize flex items-center gap-2">
        {schedule.day}
        {isToday && (
          <Badge
            variant="secondary"
            className="px-1.5 py-0 border-primary/50 text-primary text-[10px]"
          >
            Today
          </Badge>
        )}
      </span>
      <div className="flex items-center gap-2">
        {status}
        {!schedule.isClosed && (
          <span className="text-muted-foreground font-semibold">
            {schedule.openTime} - {schedule.closeTime}
          </span>
        )}
      </div>
    </div>
  );
}
