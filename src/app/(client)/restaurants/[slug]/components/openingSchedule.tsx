"use client";
import { Badge } from "@/components/ui/badge";

interface OpeningScheduleProps {
  schedule: {
    day: string;
    openTime: string;
    closeTime: string;
  };
}

function OpeningSchedule({ schedule }: OpeningScheduleProps) {
  const today = new Date();
  const day = today
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

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
      <span className="">
        {schedule.openTime} - {schedule.closeTime}
      </span>
    </div>
  );
}

export default OpeningSchedule;
