# Plan: Opening Hours Template Deletion & UI Polish

This plan addresses the bugs found in the template deletion and association workflow:

1. **TypeScript Type Mismatches:** Resolves the `'Promise<boolean | undefined>' is not assignable to type 'Promise<boolean>'` build error by updating `handleDeleteSchedule` in `useRestaurantLogic.ts` to explicitly return `false` on early exit branches.
2. **Duplicate Delete Button:** Encapsulates the open/close state (`isOpen`) directly inside the `AlertDeletion` component. We then render `<AlertDeletion>` in the template association card and remove it from the bottom of `openingHoursTab.tsx`.
3. **Select Dropdown Flickering (Optimistic ID Sync):** Adds `activeScheduleId` client state inside the hook to optimistically update the dropdown value during loading transitions, preventing flickering or jumps back to the old ID while the server page updates.

---

## Proposed Changes

### 1. Hook Logic & Mapped Types

#### [MODIFY] [useRestaurantLogic.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/hooks/useRestaurantLogic.ts)

1. Add an `activeScheduleId` state to track the active template ID locally and optimistically.
2. Update `handleDeleteSchedule` to return `Promise<boolean>` and resolve to `false` (rather than implicit `undefined`) on early return paths.
3. Revert `activeScheduleId` to initial reference if linking fails.

```typescript
// In src/hooks/useRestaurantLogic.ts:

// Add state under previewUrl state (around line 59):
const [activeScheduleId, setActiveScheduleId] = useState<string>(
  initialRestaurant?.openingHours?._id || ""
);

// Update initialRestaurant effect to sync activeScheduleId (around line 81):
useEffect(() => {
  if (initialRestaurant?.openingHours) {
    setScheduleName(initialRestaurant.openingHours.name || "Standard Hours");
    setSchedule(initialRestaurant.openingHours.schedule || []);
    setActiveScheduleId(initialRestaurant.openingHours._id || "");
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [initialRestaurant?.openingHours?._id]);

// Update handleLinkSchedule to optimistically update client select state (around line 224):
const handleLinkSchedule = async (openingHoursId: string) => {
  if (!initialRestaurant || openingHoursId === "none") return;

  setActiveScheduleId(openingHoursId); // Optimistic Update

  startTransition(async () => {
    const result = await assignScheduleToRestaurantAction(
      initialRestaurant._id,
      openingHoursId,
    );
    if (result.success) {
      toast.success("Template assigned successfully! 🔗");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to link schedule template.");
      setActiveScheduleId(initialRestaurant?.openingHours?._id || ""); // Revert on failure
    }
  });
};

// Update handleDeleteSchedule to return Promise<boolean> explicitly (around line 272):
const handleDeleteSchedule = async (openingHoursId: string): Promise<boolean> => {
  if (!initialRestaurant) return false; // Explicit false return (resolves type checking)

  const isStandard = scheduleName.trim().toLowerCase() === "standard hours";
  if (isStandard) {
    toast.error("Standard Hours template cannot be deleted.");
    return false; // Explicit false return
  }

  return new Promise<boolean>((resolve) => {
    startTransition(async () => {
      const result = await deleteScheduleAction(openingHoursId);
      if (result.success) {
        toast.success("Template deleted successfully! 🗑️");
        router.refresh();
        resolve(true);
      } else {
        toast.error(result.error || "Failed to delete schedule template.");
        resolve(false);
      }
    });
  });
};

// Make sure to expose activeScheduleId in return statement:
return {
  ...
  activeScheduleId, // Expose this
  handleDeleteSchedule,
  ...
};
```

---

### 2. Deletion Dialog Component

#### [MODIFY] [alertDeletion.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/alertDeletion.tsx)

1. Remove `isOpen` and `setIsOpen` props. Encapsulate this state locally.
2. Enable `setIsOpen(false)` on action success.

```tsx
// Complete contents for src/components/admin/features/restaurant/alertDeletion.tsx:

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface DeleteDialogProps {
  openingHoursId: string;
  handleDeleteSchedule: (id: string) => Promise<boolean>;
  isPending: boolean;
}

function AlertDeletion({
  openingHoursId,
  handleDeleteSchedule,
  isPending,
}: DeleteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          className="gap-1 cursor-pointer hover:cursor-pointer animate-in fade-in-50 duration-200"
          disabled={isPending}
          onClick={() => setIsOpen(true)}
        >
          Delete template
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the custom template. Any restaurants
            currently using it will automatically revert to &quot;Standard
            Hours&quot; to avoid broken references. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            className="hover:cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={async (e) => {
              e.preventDefault(); // Prevent closing immediately before action finishes
              const success = await handleDeleteSchedule(openingHoursId);
              if (success) {
                setIsOpen(false); // Close dialog on success
              }
            }}
            className="hover:cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>Yes, delete template</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AlertDeletion;
```

---

### 3. UI Tab Revision

#### [MODIFY] [openingHoursTab.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/openingHoursTab.tsx)

1. Add `activeScheduleId` state binding to the Select element.
2. Render `<AlertDeletion>` component directly in the card buttons block.
3. Remove local `isDeleteDialogOpen` state and the unconditional `<AlertDeletion>` at the bottom of the layout.

```tsx
// Complete contents for src/components/admin/features/restaurant/openingHoursTab.tsx:

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
    handleDeleteSchedule: (id: string) => Promise<boolean>;
    activeScheduleId: string; // Bind dropdown value here
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
    </div>
  );
}
```

---

## Verification Plan

### Automated Checks

Ensure all files build cleanly:

```powershell
npm run build
```

### Manual Testing

1. Navigate to `/admin/settings?id=[restaurantId]` and select the **Operating Hours** tab.
2. Select standard and custom templates from the Select dropdown. Ensure there is **zero flickering or jumpiness** when swapping templates.
3. Verify that the **Delete template** button is only present in the template selector card for custom templates, and is absent for `"Standard Hours"`.
4. Click **Delete template** and confirm that the Dialog opens correctly.
5. Click **Cancel** and verify that it closes.
6. Click **Delete template** -> **Yes, delete template**. Confirm that the loading spinner shows inside the dialog button, and that the dialog closes automatically upon success, redirecting the template select to `"Standard Hours"`.

## ////////////////////////////////////////////////////////////////////

# Plan: Fix Schedule Template Deletion & Form Submission Bugs

This plan addresses the bugs found in the template creation, renaming, and save workflow:

1. **Standard Hours Saving Block (Backend Bug):**
   - **Cause:** In `src/actions/admin-restaurant.ts` (lines 562-570), a redundant check blocks _any_ update to a template named `"Standard Hours"` (returning `"The 'Standard Hours' template cannot be renamed."`), even if they only updated the operating hours slots and kept the name unchanged.
   - **Fix:** Remove the redundant check (lines 562-570). The subsequent checks (lines 572-590) are correct and will only block if the name is actually changing.

2. **Form Submission on Enter in New Template Input:**
   - **Cause:** The `newTemplateName` text input is nested inside the main settings `<form>`. Pressing Enter in this input triggers the browser's default form submit behavior, which calls the parent form's `onSubmit` handler (`handleSaveSchedule()`) instead of creating the template.
   - **Fix:** Intercept the `"Enter"` key on the `newTemplateName` input, call `e.preventDefault()`, and trigger template creation (`handleCreateClick()`).

3. **TypeScript Type Mismatches:**
   - **Cause:** `handleDeleteSchedule` in `useRestaurantLogic.ts` returns `Promise<boolean | undefined>` due to implicit returns.
   - **Fix:** Change `return;` statements to `return false;` in `useRestaurantLogic.ts` to strictly return `Promise<boolean>`.

4. **Duplicate Delete Button:**
   - **Fix:** Move the `AlertDeletion` component directly to the template selector card (replacing the old button) and delete the unconditional `AlertDeletion` call from the bottom of `openingHoursTab.tsx`.

5. **Select Dropdown Flickering:**
   - **Fix:** Add an `activeScheduleId` client state inside `useRestaurantLogic.ts` to optimistically display the selected dropdown value.

---

## Proposed Changes

### 1. Server Actions & Mutations

#### [MODIFY] [admin-restaurant.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/actions/admin-restaurant.ts)

Remove the redundant check that blocks saving schedule updates for `"Standard Hours"`.

```typescript
// In src/actions/admin-restaurant.ts -> saveOpeningHoursAction:
// REMOVE lines 562 to 570 entirely:
-    // Prevent renaming "Standard Hours" (case-insensitive)
-    const isStandard =
-      currentDoc.name.trim().toLowerCase() === "standard hours";
-    if (isStandard) {
-      return {
-        success: false,
-        error: "The 'Standard Hours' template cannot be renamed.",
-      };
-    }
```

---

### 2. Client Hook Integration

#### [MODIFY] [useRestaurantLogic.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/hooks/useRestaurantLogic.ts)

1. Add `activeScheduleId` state.
2. Resolve type checks by returning `false` on early return paths inside `handleDeleteSchedule`.

```typescript
// In src/hooks/useRestaurantLogic.ts:

// Add state under previewUrl state (around line 59):
const [activeScheduleId, setActiveScheduleId] = useState<string>(
  initialRestaurant?.openingHours?._id || ""
);

// Update initialRestaurant effect to sync activeScheduleId (around line 81):
useEffect(() => {
  if (initialRestaurant?.openingHours) {
    setScheduleName(initialRestaurant.openingHours.name || "Standard Hours");
    setSchedule(initialRestaurant.openingHours.schedule || []);
    setActiveScheduleId(initialRestaurant.openingHours._id || "");
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [initialRestaurant?.openingHours?._id]);

// Update handleLinkSchedule to optimistically update client select state (around line 224):
const handleLinkSchedule = async (openingHoursId: string) => {
  if (!initialRestaurant || openingHoursId === "none") return;

  setActiveScheduleId(openingHoursId); // Optimistic Update

  startTransition(async () => {
    const result = await assignScheduleToRestaurantAction(
      initialRestaurant._id,
      openingHoursId,
    );
    if (result.success) {
      toast.success("Template assigned successfully! 🔗");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to link schedule template.");
      setActiveScheduleId(initialRestaurant?.openingHours?._id || ""); // Revert on failure
    }
  });
};

// Update handleDeleteSchedule to return Promise<boolean> explicitly (around line 272):
const handleDeleteSchedule = async (openingHoursId: string): Promise<boolean> => {
  if (!initialRestaurant) return false;

  const isStandard = scheduleName.trim().toLowerCase() === "standard hours";
  if (isStandard) {
    toast.error("Standard Hours template cannot be deleted.");
    return false;
  }

  return new Promise<boolean>((resolve) => {
    startTransition(async () => {
      const result = await deleteScheduleAction(openingHoursId);
      if (result.success) {
        toast.success("Template deleted successfully! 🗑️");
        router.refresh();
        resolve(true);
      } else {
        toast.error(result.error || "Failed to delete schedule template.");
        resolve(false);
      }
    });
  });
};

// Return from hook:
return {
  ...
  activeScheduleId,
  handleDeleteSchedule,
  ...
};
```

---

### 3. Deletion Dialog Component

#### [MODIFY] [alertDeletion.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/alertDeletion.tsx)

Remove `isOpen` / `setIsOpen` props and manage dialog state internally.

```tsx
// Complete contents for src/components/admin/features/restaurant/alertDeletion.tsx:

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface DeleteDialogProps {
  openingHoursId: string;
  handleDeleteSchedule: (id: string) => Promise<boolean>;
  isPending: boolean;
}

function AlertDeletion({
  openingHoursId,
  handleDeleteSchedule,
  isPending,
}: DeleteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          className="gap-1 cursor-pointer hover:cursor-pointer animate-in fade-in-50 duration-200"
          disabled={isPending}
          onClick={() => setIsOpen(true)}
        >
          Delete template
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the custom template. Any restaurants
            currently using it will automatically revert to &quot;Standard
            Hours&quot; to avoid broken references. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            className="hover:cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={async (e) => {
              e.preventDefault(); // Prevent closing immediately before action finishes
              const success = await handleDeleteSchedule(openingHoursId);
              if (success) {
                setIsOpen(false); // Close dialog on success
              }
            }}
            className="hover:cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>Yes, delete template</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AlertDeletion;
```

---

### 4. UI Tab Revision

#### [MODIFY] [openingHoursTab.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/openingHoursTab.tsx)

1. Add `activeScheduleId` state binding to the Select element.
2. Intercept `"Enter"` inside the `newTemplateName` input to prevent default form submission.
3. Replace the delete button in the association card with `<AlertDeletion ... />`.
4. Remove the unconditional `<AlertDeletion>` from the bottom of the file.

```tsx
// Complete contents for src/components/admin/features/restaurant/openingHoursTab.tsx:

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
    handleDeleteSchedule: (id: string) => Promise<boolean>;
    activeScheduleId: string; // Bind dropdown value here
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
                  placeholder="E.g., Holiday Hours, Summer Schedule"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // Prevent parent form submit
                      handleCreateClick();
                    }
                  }}
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
    </div>
  );
}
```

---

## Verification Plan

### Automated Checks

Ensure all files build cleanly:

```powershell
npm run build
```

### Manual Testing

1. Navigate to `/admin/settings?id=[restaurantId]` and select the **Operating Hours** tab.
2. Select standard and custom templates from the Select dropdown. Ensure there is **zero flickering or jumpiness** when swapping templates.
3. Verify that the **Delete template** button is only present in the template selector card for custom templates, and is absent for `"Standard Hours"`.
4. Click **Delete template** and confirm that the Dialog opens correctly.
5. Click **Cancel** and verify that it closes.
6. Click **Delete template** -> **Yes, delete template**. Confirm that the loading spinner shows inside the dialog button, and that the dialog closes automatically upon success, redirecting the template select to `"Standard Hours"`.
7. Click **+ New template**, enter a name in the input, and press **Enter**. Verify that the template is created successfully and **does not trigger any form submission errors** or page updates before creation.
8. Switch back to `"Standard Hours"`, modify a day's hours, and click the main **Save changes** button. Verify that the changes save successfully without triggering standard hours renaming restrictions.
