# Phase 12 Polish: Multi-Schedule Templates, Search, Pagination, & Form Footer

This plan details the integration of **Multi-Schedule Templates** alongside the Phase 12 search, pagination, and form layout polish.

## New Feature: Multiple Schedule Templates System

Currently, the weekly schedule (`openingHours`) is edited directly in place. To allow administrators to create, choose, and rename multiple schedules (e.g. `"Standard Hours"`, `"Weekend Hours"`, `"Holiday Hours"`), we will:

1. **Expose Schedule Name:** Allow updating the referenced schedule's `name` text field.
2. **Assign Existing Templates:** Allow selecting an existing template from a dropdown to link it to the restaurant.
3. **Create New Templates:** Allow creating a new `openingHours` document and immediately linking it to the current restaurant.
4. **Declarative State Resetting:** Use a unique React key (`key={restaurant.openingHours?._id}`) to force the form hook state to unmount/remount when a new template reference is assigned, avoiding client state sync bugs.

---

## Proposed Changes

### 1. Types & Server Actions

#### [MODIFY] [admin.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/types/admin.ts)

Add a summary interface for listing schedules:

```typescript
export interface ScheduleSummary {
  _id: string;
  name: string;
}
```

#### [MODIFY] [admin-restaurant.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/actions/admin-restaurant.ts)

1. Update `SaveHoursSchema` to accept `name`.
2. Add `fetchAllSchedules` to query all schedules in Sanity.
3. Add `assignScheduleToRestaurantAction` to link an existing schedule.
4. Add `createAndLinkScheduleAction` to create a new schedule document and link it to a restaurant.

```typescript
const SaveHoursSchema = z.object({
  openingHoursId: z.string().trim().min(1),
  name: z.string().trim().min(1, "Schedule name is required"), // Added name field
  schedule: z.array(
    z.object({
      day: z.string().trim(),
      openTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/, "Format must be HH:MM")
        .trim(),
      closeTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/, "Format must be HH:MM")
        .trim(),
      isClosed: z.boolean(),
    }),
  ),
});

/**
 * Fetch all available opening hours schedule templates
 */
export async function fetchAllSchedules(): Promise<ScheduleSummary[]> {
  try {
    const query = groq`*[_type == "openingHours"] | order(name asc) {
      _id,
      name
    }`;
    const { data } = await sanityFetch({
      query,
      params: {},
      tags: ["openingHours", "restaurant"],
    });
    return (data || []) as ScheduleSummary[];
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return [];
  }
}

/**
 * Assign an existing opening hours document template to a restaurant
 */
export async function assignScheduleToRestaurantAction(
  restaurantId: string,
  openingHoursId: string,
) {
  try {
    await client
      .patch(restaurantId)
      .set({
        openingHours: {
          _type: "reference",
          _ref: openingHoursId,
        },
      })
      .commit();
    revalidateTag("restaurant", "max");
    return { success: true };
  } catch (error) {
    console.error(
      `Failed to assign schedule ${openingHoursId} to restaurant ${restaurantId}:`,
      error,
    );
    return { success: false, error: "Failed to link schedule." };
  }
}

/**
 * Create a new schedule document and link it to the restaurant
 */
export async function createAndLinkScheduleAction(
  restaurantId: string,
  name: string,
) {
  try {
    // 1. Create schedule document with standard default hours
    const defaultSchedule = [
      { day: "monday", openTime: "10:00", closeTime: "23:00", isClosed: false },
      {
        day: "tuesday",
        openTime: "10:00",
        closeTime: "23:00",
        isClosed: false,
      },
      {
        day: "wednesday",
        openTime: "10:00",
        closeTime: "23:00",
        isClosed: false,
      },
      {
        day: "thursday",
        openTime: "10:00",
        closeTime: "23:00",
        isClosed: false,
      },
      { day: "friday", openTime: "10:00", closeTime: "23:00", isClosed: false },
      {
        day: "saturday",
        openTime: "10:00",
        closeTime: "23:00",
        isClosed: false,
      },
      { day: "sunday", openTime: "10:00", closeTime: "23:00", isClosed: false },
    ];

    const newDoc = await client.create({
      _type: "openingHours",
      name,
      schedule: defaultSchedule,
    });

    // 2. Link reference to restaurant
    await client
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
```

---

### 2. Custom Hooks & State Syncing

#### [MODIFY] [useRestaurantLogic.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/hooks/useRestaurantLogic.ts)

1. Add `scheduleName` state and expose its setter.
2. Update `handleSaveSchedule` to pass the `scheduleName` state to the server action.
3. Expose action wrappers for switching (`handleLinkSchedule`) and creating (`handleCreateNewSchedule`) templates.

```typescript
export function useRestaurantLogic(initialRestaurant?: RestaurantDetails) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Settings State Form Hooks
  const [name, setName] = useState(initialRestaurant?.name || "");
  const [slug, setSlug] = useState(initialRestaurant?.slug?.current || "");
  const [description, setDescription] = useState(
    initialRestaurant?.description || "",
  );
  const [phone, setPhone] = useState(initialRestaurant?.phone || "");
  const [email, setEmail] = useState(initialRestaurant?.email || "");

  const [address, setAddress] = useState(
    initialRestaurant?.location?.address || "",
  );
  const [latitude, setLatitude] = useState(
    initialRestaurant?.location?.latitude || 0,
  );
  const [longitude, setLongitude] = useState(
    initialRestaurant?.location?.longitude || 0,
  );

  const [deliveryFee, setDeliveryFee] = useState(
    initialRestaurant?.deliveryFee || 0,
  );
  const [minimumOrder, setMinimumOrder] = useState(
    initialRestaurant?.minimumOrder || 0,
  );
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(
    initialRestaurant?.estimatedDeliveryTime || 30,
  );
  const [isFeatured, setIsFeatured] = useState(
    initialRestaurant?.isFeatured || false,
  );
  const [order, setOrder] = useState(initialRestaurant?.order || 0);

  // Logo File states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Operating schedule state (Monday-Sunday slots) & Template Name
  const [scheduleName, setScheduleName] = useState(
    initialRestaurant?.openingHours?.name || "Standard Hours",
  );
  const [schedule, setSchedule] = useState<OpeningHoursSchedule["schedule"]>(
    initialRestaurant?.openingHours?.schedule || [],
  );

  // Optimistic Toggle Updates for Restaurants List
  const [optimisticActiveStates, setOptimisticActiveStates] = useState<
    Record<string, boolean>
  >({});

  const handleToggleActive = async (
    restaurantId: string,
    currentStatus: boolean,
  ) => {
    const nextStatus = !currentStatus;
    setOptimisticActiveStates((prev) => ({
      ...prev,
      [restaurantId]: nextStatus,
    }));

    startTransition(async () => {
      const result = await toggleRestaurantActiveAction({
        restaurantId,
        isActive: nextStatus,
      });
      if (result.success) {
        toast.success(`Restaurant status updated successfully.`);
      } else {
        toast.error(result.error || "Failed to update restaurant status.");
        setOptimisticActiveStates((prev) => {
          const updated = { ...prev };
          delete updated[restaurantId];
          return updated;
        });
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    // 1. Revoke the previous URL only if it was created locally (starts with 'blob:')
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file) {
      // 2. Create the new preview URL
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      // 3. Reset preview if the file is cleared
      setPreviewUrl("");
    }
  };

  const handleSaveDetails = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!initialRestaurant) return;

    startTransition(async () => {
      let imageAssetId: string | undefined = undefined;

      // 1. Upload compressed image file on the client before construction
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile, imageFile.name);
        const uploadRes = await uploadRestaurantImageAction(formData);
        if (!uploadRes.success) {
          toast.error(uploadRes.error || "Failed to upload new logo image.");
          return;
        }
        imageAssetId = uploadRes.assetId;
      }

      // 2. Save restaurant details
      const result = await saveRestaurantDetailsAction({
        restaurantId: initialRestaurant._id,
        name,
        slug,
        description,
        phone,
        email,
        location: {
          address,
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
        deliveryFee: Number(deliveryFee),
        minimumOrder: Number(minimumOrder),
        estimatedDeliveryTime: Number(estimatedDeliveryTime),
        isFeatured,
        order: Number(order),
        imageAssetId,
      });

      if (result.success) {
        toast.success("Restaurant settings updated successfully! 🎉");
        setImageFile(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save restaurant details.");
      }
    });
  };

  const handleSaveSchedule = async () => {
    if (!initialRestaurant?.openingHours?._id) {
      toast.error("Opening hours document reference not found.");
      return;
    }

    startTransition(async () => {
      const result = await saveOpeningHoursAction({
        openingHoursId: initialRestaurant.openingHours._id,
        name: scheduleName, // Pass the schedule template name
        schedule,
      });

      if (result.success) {
        toast.success("Operating schedule saved successfully! 📅");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save schedule.");
      }
    });
  };

  const handleLinkSchedule = async (openingHoursId: string) => {
    if (!initialRestaurant) return;
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
      }
    });
  };

  const handleCreateNewSchedule = async (name: string) => {
    if (!initialRestaurant) return;
    startTransition(async () => {
      const result = await createAndLinkScheduleAction(
        initialRestaurant._id,
        name,
      );
      if (result.success) {
        toast.success(`Template "${name}" created and assigned! ✨`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create new template.");
      }
    });
  };

  const handleScheduleDayChange = (
    index: number,
    field: "openTime" | "closeTime" | "isClosed",
    value: any,
  ) => {
    setSchedule((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  return {
    isPending,
    name,
    setName,
    slug,
    setSlug,
    description,
    setDescription,
    phone,
    setPhone,
    email,
    setEmail,
    address,
    setAddress,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    deliveryFee,
    setDeliveryFee,
    minimumOrder,
    setMinimumOrder,
    estimatedDeliveryTime,
    setEstimatedDeliveryTime,
    isFeatured,
    setIsFeatured,
    order,
    setOrder,
    previewUrl,
    handleFileChange,
    handleSaveDetails,
    scheduleName,
    setScheduleName,
    schedule,
    handleSaveSchedule,
    handleScheduleDayChange,
    handleLinkSchedule,
    handleCreateNewSchedule,
    optimisticActiveStates,
    handleToggleActive,
  };
}
```

---

### 3. Editor & Tab Forms Integration

#### [MODIFY] [page.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/app/admin/settings/page.tsx)

Fetch available schedule list in parallel on the server and pass them down:

```tsx
// Edit view of a single restaurant
const [restaurant, allSchedules] = await Promise.all([
  fetchRestaurantDetails(restaurantId),
  fetchAllSchedules(),
]);

// ... error check
return (
  // ... header
  <RestaurantSettingsEditor
    restaurant={restaurant}
    allSchedules={allSchedules}
  />
);
```

#### [MODIFY] [restaurantSettingsEditor.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/restaurantSettingsEditor.tsx)

Force unmount/remount on reference change using the schedule reference `_id` as the React `key` bound to the hooks. This ensures form states are instantly synchronized when the template reference swaps.

```tsx
interface RestaurantSettingsEditorProps {
  restaurant: RestaurantDetails;
  allSchedules: Array<{ _id: string; name: string }>;
}

export function RestaurantSettingsEditor({
  restaurant,
  allSchedules,
}: RestaurantSettingsEditorProps) {
  const [activeTab, setActiveTab] = useState("general");

  // React key forces hook state re-initiation if a new reference is linked
  const formLogic = useRestaurantLogic(restaurant);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (activeTab === "schedule") {
      formLogic.handleSaveSchedule();
    } else {
      formLogic.handleSaveDetails(
        e as unknown as React.SubmitEvent<HTMLFormElement>,
      );
    }
  };

  return (
    <div
      className="space-y-6"
      key={restaurant.openingHours?._id || "no-schedule"}
    >
      {/* ... Back button & Tabs Trigger list ... */}
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* ... General, Delivery, Location Content ... */}

        <TabsContent value="schedule" className="focus-visible:outline-none">
          <OpeningHoursTab
            formLogic={formLogic}
            restaurantId={restaurant._id}
            allSchedules={allSchedules}
          />
        </TabsContent>

        {/* ... Unified Action Footer ... */}
      </form>
    </div>
  );
}
```

#### [MODIFY] [openingHoursTab.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/openingHoursTab.tsx)

Add select drop-down triggers, creation input fields for new schedules, and name template renaming controls.

```tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Link2 } from "lucide-react";

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
      value: any,
    ) => void;
    handleLinkSchedule: (id: string) => Promise<void>;
    handleCreateNewSchedule: (name: string) => Promise<void>;
    isPending: boolean;
  };
  restaurantId: string;
  allSchedules: Array<{ _id: string; name: string }>;
}

export function OpeningHoursTab({
  formLogic,
  restaurantId,
  allSchedules,
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
  const activeScheduleId =
    allSchedules.find((s) => s.name === formLogic.scheduleName)?._id || "none";

  return (
    <div className="space-y-6">
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
                value={activeScheduleId}
                onValueChange={(val) => formLogic.handleLinkSchedule(val)}
                disabled={formLogic.isPending}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {allSchedules.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="gap-1 cursor-pointer shrink-0"
              disabled={formLogic.isPending}
            >
              <Plus className="size-4" /> New template
            </Button>
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
              >
                Create
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
              disabled={formLogic.isPending}
            />
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
                        className="text-xs font-semibold text-muted-foreground uppercase"
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
                        className="w-28 h-9 text-center text-sm font-semibold"
                      />
                    </div>

                    {/* Close Time */}
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`${dayObj.key}-close`}
                        className="text-xs font-semibold text-muted-foreground uppercase"
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
                        className="w-28 h-9 text-center text-sm font-semibold"
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

## Verification & Deployment Plan

### Automated Checks

Ensure TypeScript compiles without issues across all files:

```powershell
npm run build
```

### Manual Testing Instructions

1. Navigate to `/admin/settings` and choose a restaurant.
2. Select the **Operating Hours** tab.
3. In the dropdown, switch to an existing schedule template (e.g. "Weekend Hours"). Verify the UI unmounts and remounts, showing the new schedule slots.
4. Click **New Template**, type in `"Holiday Hours"`, and click **Create**. Verify the dropdown updates, the new template is assigned, and default standard hours are loaded.
5. In **Active Template Name**, rename `"Holiday Hours"` to `"Summer Holiday Hours"`.
6. Modify various daily slots, toggle closed states, and click **Save changes** at the bottom footer.
7. Confirm that changes have successfully persisted in Sanity Studio.
