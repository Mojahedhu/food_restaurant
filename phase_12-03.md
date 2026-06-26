# Plan: Schedule Template Deletion & Renaming Protections

This plan implements protections for the opening hours templates:

1. **Renaming Rules:** The `"Standard Hours"` template cannot be renamed. No other templates can be renamed to `"Standard Hours"` (case-insensitive).
2. **Deletion Rules:** All templates can be deleted **except** the `"Standard Hours"` template.
3. **Reference Integrity protection:** When a custom template is deleted, any restaurant currently referencing it is automatically reverted to the `"Standard Hours"` template in an atomic transaction before the document is deleted, preventing broken references in Sanity.

---

## Proposed Changes

### 1. Server Actions & Mutations

#### [MODIFY] [admin-restaurant.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/actions/admin-restaurant.ts)

1. Update `saveOpeningHoursAction` to prevent renaming `"Standard Hours"` (checks current name in database and prevents incoming updates, with case-insensitive checks).
2. Update `createAndLinkScheduleAction` to prevent creating a template named `"Standard Hours"` (case-insensitive).
3. Add `deleteScheduleAction` with transaction-aware reference redirects.

```typescript
// Add to imports at the top:
// import { groq } from "next-sanity"; // Already imported in the file

/**
 * Update daily opening hours schedules (with renaming restrictions)
 */
export async function saveOpeningHoursAction(rawInput: unknown) {
  const result = SaveHoursSchema.safeParse(rawInput);
  if (!result.success) {
    return { success: false, error: "Invalid schedule format." };
  }

  const { openingHoursId, name, schedule } = result.data;
  try {
    // 1. Fetch current document to check name restrictions
    const currentDoc = (await writeClient.getDocument(openingHoursId)) as any;
    if (!currentDoc) {
      return { success: false, error: "Schedule template not found." };
    }

    // Prevent renaming "Standard Hours" to anything else (case-insensitive checks)
    const isCurrentStandard =
      currentDoc.name.trim().toLowerCase() === "standard hours";
    const isNewStandard = name.trim().toLowerCase() === "standard hours";

    if (isCurrentStandard && !isNewStandard) {
      return {
        success: false,
        error: "The 'Standard Hours' template cannot be renamed.",
      };
    }

    // Prevent renaming other templates TO "Standard Hours" to avoid duplicate names
    if (!isCurrentStandard && isNewStandard) {
      return {
        success: false,
        error: "Cannot rename a template to 'Standard Hours'.",
      };
    }

    await writeClient.patch(openingHoursId).set({ name, schedule }).commit();
    revalidateTag("restaurant", "max");
    return { success: true };
  } catch (error) {
    console.error(`Failed to update opening hours ${openingHoursId}:`, error);
    return {
      success: false,
      error: "Failed to update opening hours schedule.",
    };
  }
}

/**
 * Create a new schedule document and link it to the restaurant (with validation)
 */
export async function createAndLinkScheduleAction(
  restaurantId: string,
  name: string,
) {
  try {
    if (name.trim().toLowerCase() === "standard hours") {
      return {
        success: false,
        error: "Cannot create a new template named 'Standard Hours'.",
      };
    }

    // 1. Create schedule document with standard default hours
    const defaultSchedule = [
      {
        _key: "monday",
        day: "monday",
        openTime: "09:00",
        closeTime: "23:00",
        isClosed: false,
      },
      {
        _key: "tuesday",
        day: "tuesday",
        openTime: "09:00",
        closeTime: "23:00",
        isClosed: false,
      },
      {
        _key: "wednesday",
        day: "wednesday",
        openTime: "09:00",
        closeTime: "23:00",
        isClosed: false,
      },
      {
        _key: "thursday",
        day: "thursday",
        openTime: "09:00",
        closeTime: "23:00",
        isClosed: false,
      },
      {
        _key: "friday",
        day: "friday",
        openTime: "09:00",
        closeTime: "23:00",
        isClosed: false,
      },
      {
        _key: "saturday",
        day: "saturday",
        openTime: "09:00",
        closeTime: "23:00",
        isClosed: false,
      },
      {
        _key: "sunday",
        day: "sunday",
        openTime: "09:00",
        closeTime: "23:00",
        isClosed: false,
      },
    ];

    const newDoc = await writeClient.create({
      _type: "openingHours",
      name,
      schedule: defaultSchedule,
    });

    // 2. Link reference to restaurant
    await writeClient
      .patch(restaurantId)
      .set({
        openingHours: {
          _type: "reference",
          _ref: newDoc._id,
        },
      })
      .commit();

    revalidateTag("restaurant", "max");
    return { success: true, openingHoursId: newDoc._id };
  } catch (error) {
    console.error(
      `Failed to create and link schedule for restaurant ${restaurantId}:`,
      error,
    );
    return { success: false, error: "Failed to create new schedule." };
  }
}

/**
 * Delete a custom opening hours schedule template safely.
 * Any restaurants referencing it will be automatically reverted to "Standard Hours" reference.
 */
export async function deleteScheduleAction(openingHoursId: string) {
  try {
    // 1. Fetch target schedule metadata
    const currentDoc = (await writeClient.getDocument(openingHoursId)) as any;
    if (!currentDoc) {
      return { success: false, error: "Schedule template not found." };
    }

    if (currentDoc.name.trim().toLowerCase() === "standard hours") {
      return {
        success: false,
        error: "The 'Standard Hours' template cannot be deleted.",
      };
    }

    // 2. Fetch the Standard Hours template reference ID
    const standardHours = await writeClient.fetch(
      groq`*[_type == "openingHours" && name == "Standard Hours"][0] { _id }`,
    );
    if (!standardHours?._id) {
      return {
        success: false,
        error: "Standard Hours template not found in database. Cannot delete.",
      };
    }
    const standardHoursId = standardHours._id;

    // 3. Find all restaurants referencing this custom template
    const affectedRestaurants = await writeClient.fetch(
      groq`*[_type == "restaurant" && openingHours._ref == $openingHoursId] { _id }`,
      { openingHoursId },
    );

    const transaction = writeClient.transaction();

    // 4. Update all affected restaurants to Standard Hours reference
    if (affectedRestaurants && affectedRestaurants.length > 0) {
      affectedRestaurants.forEach((res: any) => {
        transaction.patch(res._id, {
          set: {
            openingHours: {
              _type: "reference",
              _ref: standardHoursId,
            },
          },
        });
      });
    }

    // 5. Delete the schedule document itself
    transaction.delete(openingHoursId);

    // 6. Commit transaction atomically
    await transaction.commit();

    revalidateTag("restaurant", "max");
    return { success: true };
  } catch (error) {
    console.error(
      `Failed to delete schedule template ${openingHoursId}:`,
      error,
    );
    return { success: false, error: "Failed to delete schedule template." };
  }
}
```

---

### 2. Client Hook Integration

#### [MODIFY] [useRestaurantLogic.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/hooks/useRestaurantLogic.ts)

Add `deleteScheduleAction` import and expose `handleDeleteSchedule` to trigger deletion transitions.

```typescript
// Add deleteScheduleAction to the imports from "@/actions/admin-restaurant":
import {
  ...
  deleteScheduleAction,
} from "@/actions/admin-restaurant";

// Add inside useRestaurantLogic hook:
const handleDeleteSchedule = async (openingHoursId: string) => {
  if (!initialRestaurant) return;

  const isStandard = scheduleName.trim().toLowerCase() === "standard hours";
  if (isStandard) {
    toast.error("Standard Hours template cannot be deleted.");
    return;
  }

  startTransition(async () => {
    const result = await deleteScheduleAction(openingHoursId);
    if (result.success) {
      toast.success("Template deleted successfully! 🗑️");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete schedule template.");
    }
  });
};

// Return from hook:
return {
  ...
  handleDeleteSchedule,
};
```

---

### 3. UI Template Configuration Form

#### [MODIFY] [openingHoursTab.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/openingHoursTab.tsx)

1. Add `handleDeleteSchedule` type definition to the `formLogic` prop.
2. Disable the Active Template Name input field if `formLogic.scheduleName` is `"Standard Hours"`.
3. Add a "Delete Template" button in the Select Template card (only shown if not `"Standard Hours"` and a template is linked).

```tsx
interface OpeningHoursTabProps {
  formLogic: {
    scheduleName: string;
    setScheduleName: (name: string) => void;
    // ... other props
    handleLinkSchedule: (id: string) => Promise<void>;
    handleCreateNewSchedule: (name: string) => Promise<void>;
    handleDeleteSchedule: (id: string) => Promise<void>; // Added
    isPending: boolean;
  };
  openingHoursId: string | undefined;
  allSchedules?: ScheduleSummary[];
}
```

```tsx
// In openingHoursTab.tsx -> Card (Schedule Template Association)
// Replace the select and action buttons area:

<div className="flex flex-col sm:flex-row items-end gap-4">
  <div className="space-y-1.5 flex-1 w-full">
    <Label>Select Active Template</Label>
    <Select
      value={openingHoursId}
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
      className="gap-1 cursor-pointer"
      disabled={formLogic.isPending}
    >
      {showCreateForm ? <X className="size-4" /> : <Plus className="size-4" />}
      {showCreateForm ? "Cancel" : "New template"}
    </Button>

    {/* Delete template button */}
    {formLogic.scheduleName.trim().toLowerCase() !== "standard hours" &&
      openingHoursId &&
      openingHoursId !== "none" && (
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            if (
              confirm(
                "Are you sure you want to delete this schedule template? Any restaurants currently using it will automatically revert to 'Standard Hours'.",
              )
            ) {
              formLogic.handleDeleteSchedule(openingHoursId);
            }
          }}
          className="gap-1 cursor-pointer hover:cursor-pointer"
          disabled={formLogic.isPending}
        >
          Delete template
        </Button>
      )}
  </div>
</div>
```

```tsx
// In openingHoursTab.tsx -> Card (Weekly Schedule Configuration)
// Disable renaming for Standard Hours:
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
    } // Disabled check
  />
  {formLogic.scheduleName.trim().toLowerCase() === "standard hours" && (
    <p className="text-[10px] text-muted-foreground italic mt-1 font-semibold text-amber-600">
      The Standard Hours template cannot be renamed or deleted.
    </p>
  )}
</div>
```

---

## Verification Plan

### Automated Checks

Ensure all files build cleanly:

```powershell
npm run build
```

### Manual Testing

1. Navigate to `/admin/settings` and edit a restaurant linked to the `"Standard Hours"` schedule template.
2. Select the **Operating Hours** tab and verify:
   - The **Active Template Name** text field is disabled.
   - The text `"The Standard Hours template cannot be renamed or deleted."` is visible underneath the input in amber.
   - The red **Delete template** button is hidden/unavailable.
3. Switch the restaurant's active template to a custom template (or create a new template).
4. Verify:
   - The **Active Template Name** text field is enabled.
   - Rename the template and save. Verify the update works.
   - The **Delete template** button is visible.
5. Click **Delete template** and confirm the prompt.
6. Verify the template is deleted and the restaurant is successfully reverted to `"Standard Hours"` reference.
