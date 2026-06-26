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

function OpeningSchedule({ schedule }: OpeningScheduleProps) {
  const today = new Date();
  const day = today
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  const status = schedule.isClosed ? (
    <Badge
      variant={"destructive"}
      className="px-1 py-0 border-destructive/50 text-[10px] text-destructive"
    >
      Closed
    </Badge>
  ) : (
    <Badge
      variant={"secondary"}
      className="px-1 py-0 border-primary/50 text-primary text-[10px]"
    >
      Open
    </Badge>
  );

  const isToday = schedule.day === day;

  return (
    <div
      key={schedule.day}
      className={`flex justify-between text-sm p-2 rounded-md border ${isToday ? "bg-primary/10" : "bg-muted/10"} font-medium`}
    >
      <span className="capitalize flex items-center gap-2">
        {schedule.day}
        {isToday && (
          <Badge
            variant={"secondary"}
            className="px-1 py-0 border-primary/50 text-primary text-[10px]"
          >
            Today
          </Badge>
        )}
      </span>
      <div className="flex items-center gap-2">
        {status}
        {!schedule.isClosed && (
          <span className="text-muted-foreground">
            {schedule.openTime} - {schedule.closeTime}
          </span>
        )}
      </div>
    </div>
  );
}

export default OpeningSchedule;
