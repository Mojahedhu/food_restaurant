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
import { ScheduleSummary } from "@/types/admin";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AlertDeletion from "./alertDeletion";
import AlertCheck from "./alertCheck";

interface OpeningHoursTabProps {
  formLogic: {
    scheduleName: string;
    setScheduleName: (name: string) => void;
    schedule: Array<{
      day: string;
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }>;
    handleScheduleDayChange: (
      dayIndex: number,
      field: "openTime" | "closeTime" | "isClosed",
      value: string | boolean,
    ) => void;
    handleLinkSchedule: (id: string) => Promise<void>;
    handleCreateNewSchedule: (name: string) => Promise<void>;
    handleDeleteSchedule: (id: string) => Promise<boolean>; // Added
    activeScheduleId: string; // Bind dropdown value here
    confirmLinkSchedule: (shouldDiscard: boolean) => void;
    isUnsavedChangesDialogOpen: boolean;
    isPending: boolean;
  };
  openingHoursId: string | undefined;
  allSchedules?: ScheduleSummary[];
}

export function OpeningHoursTab({
  formLogic,
  allSchedules,
  openingHoursId,
}: OpeningHoursTabProps) {
  const [newTemplateName, setNewTemplateName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  const handleCreateClick = () => {
    if (!newTemplateName.trim()) return;
    formLogic.handleCreateNewSchedule(newTemplateName.trim());
    setNewTemplateName("");
    setShowCreateForm(false);
  };

  // Find the selected schedule template ID from matching the initial state

  return (
    <div className="relative space-y-6">
      {/* Template selector & creator */}
      <Card className="border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-semibold text-lg flex items-center gap-2">
            <Link2 className="size-5 text-muted-foreground" />
            Schedule Template Association
          </CardTitle>
          <CardDescription>
            Assign an existing weekly template schedule, or create a brand new
            template.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="space-y-1.5 flex-1 w-full">
              <Label>Select Active Template</Label>
              <Select
                value={formLogic.activeScheduleId}
                onValueChange={(val) => formLogic.handleLinkSchedule(val)}
                disabled={formLogic.isPending}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {allSchedules?.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="gap-1 cursor-pointer shrink-0"
                disabled={formLogic.isPending}
              >
                {showCreateForm ? (
                  <X className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}
                {showCreateForm ? "Cancel" : "New template"}
              </Button>

              {/* Controlled AlertDeletion component mounted inside the association card */}
              {formLogic.scheduleName.trim().toLowerCase() !==
                "standard hours" &&
                openingHoursId &&
                openingHoursId !== "none" && (
                  <AlertDeletion
                    openingHoursId={openingHoursId}
                    handleDeleteSchedule={formLogic.handleDeleteSchedule}
                    isPending={formLogic.isPending}
                  />
                )}
            </div>
          </div>

          {showCreateForm && (
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50/50 mt-2">
              <div className="flex-1">
                <Input
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // Prevent parent form submit
                      handleCreateClick();
                    }
                  }}
                  id="newTemplateName"
                  placeholder="E.g., Holiday Hours, Summer Schedule"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="bg-background h-9 text-sm"
                  disabled={formLogic.isPending}
                />
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleCreateClick}
                disabled={formLogic.isPending || !newTemplateName.trim()}
                className="min-w-16 hover:cursor-pointer"
              >
                {formLogic.isPending ? (
                  <div className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor Content */}
      <Card className="border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-semibold text-lg">
            Weekly Schedule Configuration
          </CardTitle>
          <CardDescription>
            Configure timing settings and the template name for this active
            schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Editable schedule template name */}
          <div className="space-y-1.5 max-w-sm pb-2 border-b">
            <Label htmlFor="scheduleTemplateName">Active Template Name</Label>
            <Input
              id="scheduleTemplateName"
              value={formLogic.scheduleName}
              onChange={(e) => formLogic.setScheduleName(e.target.value)}
              className="bg-background"
              required
              disabled={
                formLogic.isPending ||
                formLogic.scheduleName.trim().toLowerCase() === "standard hours"
              }
            />
            {formLogic.scheduleName.trim().toLowerCase() ===
              "standard hours" && (
              <p className="text-[10px] text-amber-600 font-semibold italic mt-1">
                The Standard Hours template cannot be renamed or deleted.
              </p>
            )}
          </div>

          <div className="space-y-4">
            {daysOfWeek.map((dayObj) => {
              const dayIndex = (formLogic.schedule || []).findIndex(
                (s) => s.day === dayObj.key,
              );
              if (dayIndex === -1) return null;
              const daySlot = formLogic.schedule[dayIndex];

              return (
                <div
                  key={dayObj.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 border rounded-lg hover:bg-slate-50/40 transition-colors"
                >
                  <span className="font-bold text-sm text-slate-800 w-28 capitalize">
                    {dayObj.label}
                  </span>

                  <div className="flex flex-wrap items-center gap-6">
                    {/* Open Time */}
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`${dayObj.key}-open`}
                        className="text-xs font-semibold text-primary uppercase"
                      >
                        Open
                      </Label>
                      <Input
                        id={`${dayObj.key}-open`}
                        type="time"
                        value={daySlot.openTime}
                        disabled={daySlot.isClosed || formLogic.isPending}
                        onChange={(e) =>
                          formLogic.handleScheduleDayChange(
                            dayIndex,
                            "openTime",
                            e.target.value,
                          )
                        }
                        className="w-28 h-9 text-center text-sm font-semibold border-primary"
                      />
                    </div>

                    {/* Close Time */}
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`${dayObj.key}-close`}
                        className="text-xs font-semibold text-destructive uppercase"
                      >
                        Close
                      </Label>
                      <Input
                        id={`${dayObj.key}-close`}
                        type="time"
                        value={daySlot.closeTime}
                        disabled={daySlot.isClosed || formLogic.isPending}
                        onChange={(e) =>
                          formLogic.handleScheduleDayChange(
                            dayIndex,
                            "closeTime",
                            e.target.value,
                          )
                        }
                        className="w-28 h-9 text-center text-sm font-semibold border-destructive"
                      />
                    </div>

                    {/* Closed toggle */}
                    <div className="flex items-center gap-2 border-l pl-4">
                      <Switch
                        id={`${dayObj.key}-closed`}
                        checked={daySlot.isClosed}
                        onCheckedChange={(checked) =>
                          formLogic.handleScheduleDayChange(
                            dayIndex,
                            "isClosed",
                            checked,
                          )
                        }
                        disabled={formLogic.isPending}
                        className="data-[state=checked]:bg-destructive cursor-pointer"
                      />
                      <Label
                        htmlFor={`${dayObj.key}-closed`}
                        className="text-xs font-bold text-muted-foreground"
                      >
                        Closed
                      </Label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AlertCheck
        isUnsavedChangesDialogOpen={formLogic.isUnsavedChangesDialogOpen}
        confirmLinkSchedule={formLogic.confirmLinkSchedule}
      />
    </div>
  );
}
