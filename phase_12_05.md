# Plan: Restaurant settings template management & UI revision (Revised)

This plan implements a robust and polished schedule template management system. It fixes all compilation errors, prevents form submission on Enter, ensures dialog states are controlled, and fixes Select dropdown flickering.

---

## Identified Issues & Resolutions

1. **TypeScript Build Error (`Promise<boolean | undefined>` vs. `Promise<boolean>`):**
   - **Cause:** `handleDeleteSchedule` in `useRestaurantLogic.ts` returns `undefined` (implicitly) on early exit paths (like if `initialRestaurant` is not loaded or the standard hours template is targeted).
   - **Fix:** Change `return;` to `return false;` in all exit branches to ensure the return type matches `Promise<boolean>` strictly.

2. **Form Submission on Enter Key inside Create Template Input:**
   - **Cause:** The text input for creating a new template is nested inside the settings form. Pressing Enter inside it triggers the browser's default form submit behavior (saving the tab's hours instead of creating the template).
   - **Fix:** Intercept the `"Enter"` key on the input in `openingHoursTab.tsx` to call `e.preventDefault()` and trigger the template creation logic.

3. **Duplicate Delete Button:**
   - **Cause:** Rendering the `AlertDeletion` component unconditionally at the bottom of the tab layout while keeping a standalone button in the active template card causes two buttons to render.
   - **Fix:** Mount `AlertDeletion` only inside the active template card (replacing the old button) and delete the unconditional `AlertDeletion` call from the bottom of the layout.

4. **Select Dropdown Flickering (Optimistic ID Sync):**
   - **Cause:** The select dropdown value is bound directly to the server prop `restaurant.openingHours?._id`. When switching templates, the select jumps back to the old ID during the revalidation transition before updated server props arrive.
   - **Fix:** Introduce an `activeScheduleId` state in the hook to immediately reflect the selected template in the UI and only revert it on failure.

5. **Client-side Renaming Validation:**
   - **Fix:** Add a client-side warning if a user attempts to rename a custom template to `"Standard Hours"` (case-insensitive) to prevent unnecessary backend calls.

---

## Proposed Changes

### 1. Server Actions & Mutations

#### [MODIFY] [admin-restaurant.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/actions/admin-restaurant.ts)

Remove the redundant check in `saveOpeningHoursAction` that blocks saving hours updates to `"Standard Hours"`.

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
3. Add a dirty-checking prompt inside `handleLinkSchedule` to warn the user if they try to switch templates with unsaved hours changes.

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

// Update handleLinkSchedule to add dirty-checking and optimistic select state:
const handleLinkSchedule = async (openingHoursId: string) => {
  if (!initialRestaurant || openingHoursId === "none") return;

  // Dirty-check unsaved hours changes
  const isDirty = JSON.stringify(schedule) !== JSON.stringify(initialRestaurant?.openingHours?.schedule);
  if (isDirty) {
    const confirmSwitch = confirm("You have unsaved changes in your current schedule. Are you sure you want to discard them and switch templates?");
    if (!confirmSwitch) {
      // Revert select component UI value back to current ID
      setActiveScheduleId(initialRestaurant?.openingHours?._id || "");
      return;
    }
  }

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

// Update handleDeleteSchedule to return Promise<boolean> explicitly:
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

Remove `isOpen` / `setIsOpen` props and manage dialog state internally to avoid global hooks pollution.

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
5. Add frontend client-side validation to warn when renaming to `"Standard Hours"`.

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

  // Frontend rename validation
  const originalName =
    allSchedules?.find((s) => s._id === openingHoursId)?.name || "";
  const isCurrentStandard =
    originalName.trim().toLowerCase() === "standard hours";
  const isNewStandard =
    formLogic.scheduleName.trim().toLowerCase() === "standard hours";
  const isAttemptingRenameToStandard = !isCurrentStandard && isNewStandard;

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
            {isAttemptingRenameToStandard && (
              <p className="text-[10px] text-destructive font-semibold italic mt-1 animate-in fade-in-50 duration-200">
                Cannot rename a custom template to &quot;Standard Hours&quot;.
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
3. Modify hours slots and try to switch dropdown templates. Confirm you get a warning prompt about unsaved changes.
4. Verify that the **Delete template** button is only present in the template selector card for custom templates, and is absent for `"Standard Hours"`.
5. Click **Delete template** and confirm that the Dialog opens correctly.
6. Click **Cancel** and verify that it closes.
7. Click **Delete template** -> **Yes, delete template**. Confirm that the loading spinner shows inside the dialog button, and that the dialog closes automatically upon success, redirecting the template select to `"Standard Hours"`.
8. Click **+ New template**, enter a name in the input, and press **Enter**. Verify that the template is created successfully and **does not trigger any form submission errors** or page updates before creation.
9. Switch back to `"Standard Hours"`, modify a day's hours, and click the main **Save changes** button. Verify that the changes save successfully without triggering standard hours renaming restrictions.
10. Open a custom template name and type "Standard Hours". Confirm you get an inline warning in red: `"Cannot rename a custom template to 'Standard Hours'."` and that submitting returns an error.

## ==============================================================================

## ======================================================================================

## ======================================================================================

## ======================================================================================

## ======================================================================================

## ======================================================================================

## ======================================================================================

## ======================================================================================

## ======================================================================================

## ======================================================================================

## ======================================================================================

## ======================================================================================

# Plan: Restaurant settings template management & UI revision (Revised)

This plan implements a robust and polished schedule template management system. It fixes all compilation errors, prevents form submission on Enter, ensures dialog states are controlled, and replaces all native browser alerts/confirmations with beautiful `shadcn/ui` dialogs.

---

## Identified Issues & Resolutions

1. **TypeScript Build Error (`Promise<boolean | undefined>` vs. `Promise<boolean>`):**
   - **Fix:** Change `return;` to `return false;` in all exit branches of `handleDeleteSchedule` in `useRestaurantLogic.ts` to ensure it strictly matches `Promise<boolean>`.

2. **Form Submission on Enter Key inside Create Template Input:**
   - **Fix:** Intercept the `"Enter"` key on the input in `openingHoursTab.tsx` to call `e.preventDefault()` and trigger the template creation logic.

3. **Duplicate Delete Button:**
   - **Fix:** Mount `AlertDeletion` only inside the active template card (replacing the old button) and delete the unconditional `AlertDeletion` call from the bottom of the layout.

4. **Select Dropdown Flickering (Optimistic ID Sync):**
   - **Fix:** Introduce an `activeScheduleId` state in the hook to immediately reflect the selected template in the UI and only revert it on failure.

5. **Client-side Renaming Validation:**
   - **Fix:** Add a client-side warning if a user attempts to rename a custom template to `"Standard Hours"` (case-insensitive) to prevent unnecessary backend calls.

6. **Smart Dialog for Unsaved Changes (No Native Popups):**
   - **Fix:** Replace the native browser `confirm(...)` for unsaved changes with a controlled `AlertDialog` from `shadcn/ui` that opens when switching templates if the schedule configuration has unsaved modifications.

---

## Proposed Changes

### 1. Server Actions & Mutations

#### [MODIFY] [admin-restaurant.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/actions/admin-restaurant.ts)

Remove the redundant check in `saveOpeningHoursAction` that blocks saving hours updates to `"Standard Hours"`.

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

1. Add `activeScheduleId`, `isUnsavedChangesDialogOpen`, and `pendingScheduleId` states.
2. Add `confirmLinkSchedule` to manage the transition from the shadcn dialog options.
3. Update `handleDeleteSchedule` to return `Promise<boolean>` and resolve to `false` (rather than implicit `undefined`) on early return paths.

```typescript
// In src/hooks/useRestaurantLogic.ts:

// Add states under previewUrl state (around line 59):
const [activeScheduleId, setActiveScheduleId] = useState<string>(
  initialRestaurant?.openingHours?._id || ""
);
const [isUnsavedChangesDialogOpen, setIsUnsavedChangesDialogOpen] = useState(false);
const [pendingScheduleId, setPendingScheduleId] = useState("");

// Update initialRestaurant effect to sync activeScheduleId (around line 81):
useEffect(() => {
  if (initialRestaurant?.openingHours) {
    setScheduleName(initialRestaurant.openingHours.name || "Standard Hours");
    setSchedule(initialRestaurant.openingHours.schedule || []);
    setActiveScheduleId(initialRestaurant.openingHours._id || "");
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [initialRestaurant?.openingHours?._id]);

// Update handleLinkSchedule to dirty-check and open the custom dialog state (around line 224):
const handleLinkSchedule = async (openingHoursId: string) => {
  if (!initialRestaurant || openingHoursId === "none") return;

  // Dirty-check unsaved hours changes
  const isDirty = JSON.stringify(schedule) !== JSON.stringify(initialRestaurant?.openingHours?.schedule);
  if (isDirty) {
    setPendingScheduleId(openingHoursId);
    setIsUnsavedChangesDialogOpen(true);
    return;
  }

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

// Add confirmLinkSchedule action to execute the pending link after confirmation:
const confirmLinkSchedule = (discardChanges: boolean) => {
  setIsUnsavedChangesDialogOpen(false);

  if (discardChanges && pendingScheduleId) {
    const nextId = pendingScheduleId;
    setPendingScheduleId("");
    setActiveScheduleId(nextId);

    startTransition(async () => {
      const result = await assignScheduleToRestaurantAction(
        initialRestaurant!._id,
        nextId,
      );
      if (result.success) {
        toast.success("Template assigned successfully! 🔗");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to link schedule template.");
        setActiveScheduleId(initialRestaurant?.openingHours?._id || ""); // Revert on failure
      }
    });
  } else {
    // Revert select back to current active ID
    setActiveScheduleId(initialRestaurant?.openingHours?._id || "");
    setPendingScheduleId("");
  }
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
  isUnsavedChangesDialogOpen,
  confirmLinkSchedule,
  handleDeleteSchedule,
  ...
};
```

---

### 3. Deletion Dialog Component

#### [MODIFY] [alertDeletion.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/alertDeletion.tsx)

Remove `isOpen` / `setIsOpen` props and manage dialog state internally to avoid parent hook pollution.

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

1. Add `activeScheduleId`, `isUnsavedChangesDialogOpen`, and `confirmLinkSchedule` state bindings.
2. Intercept `"Enter"` inside the `newTemplateName` input to prevent default form submission.
3. Replace the delete button in the association card with `<AlertDeletion ... />`.
4. Remove the unconditional `<AlertDeletion>` from the bottom of the file.
5. Render the custom `AlertDialog` for unsaved changes detection at the bottom of the layout.

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    isUnsavedChangesDialogOpen: boolean;
    confirmLinkSchedule: (discardChanges: boolean) => void;
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

  // Frontend rename validation
  const originalName =
    allSchedules?.find((s) => s._id === openingHoursId)?.name || "";
  const isCurrentStandard =
    originalName.trim().toLowerCase() === "standard hours";
  const isNewStandard =
    formLogic.scheduleName.trim().toLowerCase() === "standard hours";
  const isAttemptingRenameToStandard = !isCurrentStandard && isNewStandard;

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
            {isAttemptingRenameToStandard && (
              <p className="text-[10px] text-destructive font-semibold italic mt-1 animate-in fade-in-50 duration-200">
                Cannot rename a custom template to &quot;Standard Hours&quot;.
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

      {/* Controlled Unsaved Changes Alert Dialog from shadcn/ui */}
      <AlertDialog
        open={formLogic.isUnsavedChangesDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            formLogic.confirmLinkSchedule(false); // User closed/canceled
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes detected</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in your weekly schedule configuration.
              Switching templates now will discard these modifications. Do you
              want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => formLogic.confirmLinkSchedule(false)}
              className="hover:cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => formLogic.confirmLinkSchedule(true)}
              className="hover:cursor-pointer"
            >
              Discard changes & Switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```
