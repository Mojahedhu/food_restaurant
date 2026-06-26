# Phase 12 Polish: Restaurant Search, Pagination, & Operating Hours Enhancements

This plan outlines the polish improvements for Phase 12. It covers:

1. **Server-side Search & Pagination:** Moving the client-side search in the restaurant table to server-side search, status/featured filtering, and URL-driven pagination using the common `PaginationControls` component.
2. **Unified Action Footer:** Modifying the settings editor layout so that the "Cancel" and "Save changes" buttons are rendered below the tab layout in a consistent position, functioning correctly across all tabs (including Operating Hours).
3. **Toggle Bug & Schedule Indexing Fix:** Fixing the day toggle closed switch to invoke schedule changes instead of the global status toggle, and resolving array indexing issues.
4. **Sanity Schema Validation Consistency:** Adding a 24-hour validation regex to Sanity's opening/closing times schema to align with Zod server validation rules.

---

## Proposed Changes

We group the required changes by backend query, client filters, page composition, and tab forms.

### 1. Server Actions & Queries

#### [MODIFY] [admin-restaurant.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/actions/admin-restaurant.ts)

Update `fetchAdminRestaurants` to handle options for pagination (`page`, `pageSize`), keyword search, active status, and featured filtering.

```typescript
/**
 * Fetch restaurants with options for server-side search, filtering, and pagination
 */
export async function fetchAdminRestaurants(options?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  featured?: string;
}): Promise<{ restaurants: RestaurantDetails[]; totalItems: number }> {
  try {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 5; // Default to 5 to make pagination visible
    const search = options?.search?.trim() || "";
    const status = options?.status || "all";
    const featured = options?.featured || "all";

    // Build dynamic GROQ filter conditions
    const filters = [`_type == "restaurant"`];
    const params: Record<string, any> = {};

    if (search) {
      filters.push(`(name match $search || location.address match $search)`);
      params.search = `*${search}*`;
    }

    if (status === "active") {
      filters.push(`isActive == true`);
    } else if (status === "inactive") {
      filters.push(`isActive == false`);
    }

    if (featured === "featured") {
      filters.push(`isFeatured == true`);
    } else if (featured === "standard") {
      filters.push(`isFeatured == false`);
    }

    const filterStr = filters.join(" && ");

    // Compute range boundaries for pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    // GROQ project matching query & total count in a single round-trip
    const query = groq`{
      "restaurants": *[${filterStr}] | order(order asc, name asc) [$start...$end] {
        _id,
        _createdAt,
        name,
        slug,
        description,
        image,
        phone,
        email,
        location,
        deliveryFee,
        minimumOrder,
        estimatedDeliveryTime,
        isActive,
        isFeatured,
        order,
        openingHours-> {
          _id,
          name,
          schedule
        }
      },
      "totalItems": count(*[${filterStr}])
    }`;

    const { data } = await sanityFetch({
      query,
      params: {
        ...params,
        start,
        end,
      },
      tags: ["restaurant"],
    });

    return {
      restaurants: (data?.restaurants || []) as RestaurantDetails[],
      totalItems: data?.totalItems || 0,
    };
  } catch (error) {
    console.error("Failed to fetch admin restaurants:", error);
    return { restaurants: [], totalItems: 0 };
  }
}
```

---

### 2. Search & Filtering Components

#### [NEW] [restaurantFilter.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/restaurantFilter.tsx)

Create a dedicated search and filter bar component using input debouncing and Next.js URL query routing.

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

export function RestaurantFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for search typing to support debouncing
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const status = searchParams.get("status") || "all";
  const featured = searchParams.get("featured") || "all";

  // Debounce search input updates (400ms delay)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (search === urlSearch) return;

    const delayDebounce = setTimeout(() => {
      updateUrlParam("search", search);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Sync state if URL query is cleared/changed externally
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (search !== urlSearch) {
      setSearch(urlSearch);
    }
  }, [searchParams]);

  const updateUrlParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset page to 1 when filters change

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch("");
    router.push(pathname);
  };

  const hasActiveFilters =
    search.trim() !== "" || status !== "all" || featured !== "all";

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border">
      {/* Search Input field */}
      <div className="relative w-full md:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search name or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4"
        />
      </div>

      {/* Select Dropdowns */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Status Filter */}
        <Select
          value={status}
          onValueChange={(val) => updateUrlParam("status", val)}
        >
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Open / Active</SelectItem>
            <SelectItem value="inactive">Closed / Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Featured Filter */}
        <Select
          value={featured}
          onValueChange={(val) => updateUrlParam("featured", val)}
        >
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Featured</SelectItem>
            <SelectItem value="featured">Featured Only</SelectItem>
            <SelectItem value="standard">Standard Only</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-9 px-3 gap-1 hover:text-destructive"
          >
            <X className="size-4" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
```

#### [MODIFY] [restaurantList.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/restaurantList.tsx)

Remove local search state and filtering logic, rendering the pre-filtered items list directly.

```tsx
"use client";

import { RestaurantDetails } from "@/types/admin";
import { useRestaurantLogic } from "@/hooks/useRestaurantLogic";
import { Link } from "next-view-transitions";
import { urlFor } from "@/sanity/lib/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Edit, Utensils } from "lucide-react";
import Image from "next/image";

interface RestaurantListProps {
  initialRestaurants: RestaurantDetails[];
}

export function RestaurantList({ initialRestaurants }: RestaurantListProps) {
  const { handleToggleActive, optimisticActiveStates, isPending } =
    useRestaurantLogic();

  return (
    <div className="space-y-4">
      {/* Restaurants Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Restaurant</TableHead>
              <TableHead>Location & Contact</TableHead>
              <TableHead className="w-[120px]">Delivery rules</TableHead>
              <TableHead className="w-[100px] text-center">Featured</TableHead>
              <TableHead className="w-[100px] text-center">
                Order status
              </TableHead>
              <TableHead className="w-[80px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialRestaurants.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No restaurants found matching the criteria.
                </TableCell>
              </TableRow>
            ) : (
              initialRestaurants.map((res) => {
                const isActive =
                  optimisticActiveStates[res._id] !== undefined
                    ? optimisticActiveStates[res._id]
                    : res.isActive;

                return (
                  <TableRow
                    key={res._id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    {/* Restaurant Info Cell */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 rounded-lg overflow-hidden border bg-slate-50 flex items-center justify-center shrink-0">
                          {res.image ? (
                            <Image
                              src={urlFor(res.image).url()}
                              alt={res.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <Utensils className="size-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm leading-none">
                            {res.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 capitalize">
                            {res.slug.current}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Location Cell */}
                    <TableCell className="max-w-[200px]">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" />
                          <span className="truncate">
                            {res.location.address}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="size-3.5 shrink-0" />
                          <span>{res.phone}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Delivery details */}
                    <TableCell>
                      <div className="text-xs space-y-0.5 font-medium">
                        <p>
                          Fee:{" "}
                          <span className="text-slate-950">
                            ${res.deliveryFee}
                          </span>
                        </p>
                        <p>
                          Min Order:{" "}
                          <span className="text-slate-950">
                            ${res.minimumOrder}
                          </span>
                        </p>
                        <p>
                          ETA:{" "}
                          <span className="text-slate-950">
                            {res.estimatedDeliveryTime}m
                          </span>
                        </p>
                      </div>
                    </TableCell>

                    {/* Featured Status badge */}
                    <TableCell className="text-center">
                      {res.isFeatured ? (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10">
                          Featured
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground font-semibold">
                          -
                        </span>
                      )}
                    </TableCell>

                    {/* Active toggle */}
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Switch
                          checked={isActive}
                          disabled={isPending}
                          onCheckedChange={() =>
                            handleToggleActive(res._id, isActive)
                          }
                        />
                        <span
                          className={`text-xs font-semibold w-10 text-left ${isActive ? "text-emerald-500" : "text-muted-foreground"}`}
                        >
                          {isActive ? "Open" : "Closed"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Edit button */}
                    <TableCell className="text-right">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8"
                      >
                        <Link href={`/admin/settings?id=${res._id}`}>
                          <Edit className="size-3.5 mr-1" /> Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

---

### 3. Page Layout Integration

#### [MODIFY] [page.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/app/admin/settings/page.tsx)

Integrate search params, status and featured filters, paginated fetching, `RestaurantFilter`, and reusable `PaginationControls` to compose the page.

```tsx
import { Metadata } from "next";
import {
  fetchAdminRestaurants,
  fetchRestaurantDetails,
} from "@/actions/admin-restaurant";
import { RestaurantList } from "@/components/admin/features/restaurant/restaurantList";
import { RestaurantFilter } from "@/components/admin/features/restaurant/restaurantFilter";
import { RestaurantSettingsEditor } from "@/components/admin/features/restaurant/restaurantSettingsEditor";
import { PaginationControls } from "@/components/admin/features/orders/paginationControls";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Restaurant Info & Settings Center | Quick Food Admin",
  description:
    "Configure restaurant profiles, weekly schedules, location metrics, and delivery settings.",
};

interface SettingsPageProps {
  searchParams: Promise<{
    id?: string;
    search?: string;
    status?: string;
    featured?: string;
    page?: string;
  }>;
}

export default async function SettingsCenterPage({
  searchParams,
}: SettingsPageProps) {
  const resolvedParams = await searchParams;
  const restaurantId = resolvedParams.id;

  if (!restaurantId) {
    // 1. Parse filter and paging search params
    const currentPage = Number(resolvedParams.page || "1");
    const search = resolvedParams.search || "";
    const status = resolvedParams.status || "all";
    const featured = resolvedParams.featured || "all";
    const pageSize = 5; // Set page size to 5 for clear testable pagination

    // 2. Fetch page and count on Sanity
    const { restaurants, totalItems } = await fetchAdminRestaurants({
      page: currentPage,
      pageSize,
      search,
      status,
      featured,
    });

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Restaurant Settings Center
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Toggle accepting orders, update delivery fees, and configure active
            schedules for partner locations ({totalItems} total).
          </p>
        </div>

        <Separator />

        {/* Dynamic Filters */}
        <RestaurantFilter />

        {/* Data Table */}
        <RestaurantList initialRestaurants={restaurants} />

        {/* Reusable Pagination */}
        <PaginationControls
          totalItems={totalItems}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      </div>
    );
  }

  // Edit view of a single restaurant
  const restaurant = await fetchRestaurantDetails(restaurantId);

  if (!restaurant) {
    return (
      <div className="p-10 border border-dashed rounded-xl text-center text-muted-foreground space-y-3">
        <p className="text-base font-medium">
          Restaurant details not found in Sanity CMS.
        </p>
        <a
          href="/admin/settings"
          className="inline-block text-primary underline text-sm hover:text-primary/80 font-semibold"
        >
          Return to All Restaurants
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Restaurant Profile
        </h1>
        <p className="text-muted-foreground text-sm">
          Update branding, delivery configurations, and operational schedules
          for{" "}
          <span className="font-semibold text-foreground">
            {restaurant.name}
          </span>
          .
        </p>
      </div>

      <Separator />

      <RestaurantSettingsEditor restaurant={restaurant} />
    </div>
  );
}
```

---

### 4. Tab Shell & Actions Restructuring

#### [MODIFY] [restaurantSettingsEditor.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/restaurantSettingsEditor.tsx)

Track the `activeTab` inside local state, wrapping all tabs content in a single `<form onSubmit={handleFormSubmit}>`. Place the "Cancel" and "Save changes" buttons in a static block outside the tabs content, so they appear consistently across all tabs, including the Operating Hours schedule view.

```tsx
"use client";

import { useState } from "react";
import { RestaurantDetails } from "@/types/admin";
import { useRestaurantLogic } from "@/hooks/useRestaurantLogic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeliveryPricingTab } from "./deliveryPricingTab";
import { LocationTab } from "./locationTab";
import { OpeningHoursTab } from "./openingHoursTab";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Landmark, Truck, Map, CalendarRange } from "lucide-react";
import { Link } from "next-view-transitions";
import { GeneralInfoTab } from "./generalInfoTab";

interface RestaurantSettingsEditorProps {
  restaurant: RestaurantDetails;
}

export function RestaurantSettingsEditor({
  restaurant,
}: RestaurantSettingsEditorProps) {
  const [activeTab, setActiveTab] = useState("general");
  const formLogic = useRestaurantLogic(restaurant);

  // Form submit handler that routes based on the active tab
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (activeTab === "schedule") {
      formLogic.handleSaveSchedule();
    } else {
      // Cast the FormEvent to match hook signature
      formLogic.handleSaveDetails(
        e as unknown as React.SubmitEvent<HTMLFormElement>,
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div className="flex items-center">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href="/admin/settings">
            <ArrowLeft className="size-4" /> Back to all restaurants
          </Link>
        </Button>
      </div>

      {/* Editor Layout Tabs */}
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-muted/50 p-1 border rounded-lg h-auto gap-1">
            <TabsTrigger
              value="general"
              className="py-2.5 flex items-center justify-center gap-1.5 font-medium cursor-pointer"
            >
              <Landmark className="size-4" /> Profile Info
            </TabsTrigger>
            <TabsTrigger
              value="delivery"
              className="py-2.5 flex items-center justify-center gap-1.5 font-medium cursor-pointer"
            >
              <Truck className="size-4" /> Delivery rules
            </TabsTrigger>
            <TabsTrigger
              value="location"
              className="py-2.5 flex items-center justify-center gap-1.5 font-medium cursor-pointer"
            >
              <Map className="size-4" /> Address & Location
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="py-2.5 flex items-center justify-center gap-1.5 font-medium cursor-pointer"
            >
              <CalendarRange className="size-4" /> Operating Hours
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="focus-visible:outline-none">
            <GeneralInfoTab formLogic={formLogic} logoUrl={restaurant.image} />
          </TabsContent>

          <TabsContent value="delivery" className="focus-visible:outline-none">
            <DeliveryPricingTab formLogic={formLogic} />
          </TabsContent>

          <TabsContent value="location" className="focus-visible:outline-none">
            <LocationTab formLogic={formLogic} />
          </TabsContent>

          <TabsContent value="schedule" className="focus-visible:outline-none">
            <OpeningHoursTab
              formLogic={formLogic}
              restaurantId={restaurant._id}
            />
          </TabsContent>

          {/* Unified Action Footer (visible on all tabs, including schedule) */}
          <div className="flex justify-end gap-3 border-t border-border pt-6 mt-6">
            <Button asChild variant="ghost" disabled={formLogic.isPending}>
              <Link href="/admin/settings">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={formLogic.isPending}
              className="min-w-32 cursor-pointer"
            >
              {formLogic.isPending ? (
                <div className="size-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  );
}
```

---

### 5. Schedule Editing & Bugfixes

#### [MODIFY] [openingHoursTab.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/openingHoursTab.tsx)

- Remove the duplicate bottom action buttons.
- Fix day closing toggle bug: change the Switch callback to use `formLogic.handleScheduleDayChange` instead of the global `handleToggleActive`.
- Safely resolve the array index of the day item inside `formLogic.schedule` using `findIndex()` to prevent misaligned indexing issues.
- Recommend updating the input `type` to `"time"` to provide a clean browser time picker interface.

```tsx
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

interface OpeningHoursTabProps {
  formLogic: {
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
    isPending: boolean;
  };
  restaurantId: string;
}

export function OpeningHoursTab({
  formLogic,
  restaurantId,
}: OpeningHoursTabProps) {
  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  return (
    <Card className="border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="font-semibold text-lg">Weekly Schedule</CardTitle>
        <CardDescription>
          Set standard opening/closing times. Toggle &apos;Closed&apos; for
          non-operational days.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {daysOfWeek.map((dayObj) => {
            // Safe index lookup to prevent out-of-order array misalignment
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
                      type="time" // Use HTML5 time input for robust format validation
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
                      type="time" // Use HTML5 time input for robust format validation
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
  );
}
```

---

### 6. Schema Consistency

#### [MODIFY] [openingHours.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/sanity/schemaTypes/openingHours.ts)

Add rule regex validation on opening hours to guarantee time entries match valid `HH:MM` patterns directly inside Sanity Studio, ensuring database-level consistency with the Zod validation schema.

```typescript
            {
              name: "openTime",
              title: "Opening Time",
              type: "string",
              description: "Format HH:MM (24-hour format, e.g. 10:00)",
              validation: (Rule) =>
                Rule.required().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, {
                  name: "24-hour time format (HH:MM)",
                  invert: false,
                }),
            },
            {
              name: "closeTime",
              title: "Closing Time",
              type: "string",
              description: "Format HH:MM (24-hour format, e.g. 23:00)",
              validation: (Rule) =>
                Rule.required().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, {
                  name: "24-hour time format (HH:MM)",
                  invert: false,
                }),
            },
```

---

## Verification Plan

### Automated Verification

Run the following build and type-checking commands to ensure the revised hooks, forms, actions, and search parameters compile cleanly:

```powershell
npm run build
```

### Manual Verification

1. Open `/admin/settings` and verify the table starts at Page 1 showing 5 items.
2. Enter a search query in the new filter bar. Verify that results filter instantly (debounced) and the URL updates with `?search=...`.
3. Change Status and Featured dropdown filters. Confirm page changes reset back to `1`.
4. Click through pagination controls. Verify URL parameters transition smoothly.
5. Click **Edit** on a restaurant. Go to the **Operating Hours** tab and verify the "Cancel" and "Save changes" buttons remain at the bottom footer.
6. Toggle the **Closed** state switch on any day. Verify that the Open/Close inputs are disabled dynamically and no global active toggle request is dispatched.
7. Modify open/close times, click **Save changes**, and confirm the toast signals a successful update.

# Polish Phase 12 Task List

- [ ] Modify `src/actions/admin-restaurant.ts` to support server-side filters and paging
- [ ] Create filter component `src/components/admin/features/restaurant/restaurantFilter.tsx`
- [ ] Modify table list `src/components/admin/features/restaurant/restaurantList.tsx` to remove inline search
- [ ] Modify main page `src/app/admin/settings/page.tsx` to connect filters and `PaginationControls`
- [ ] Modify settings shell `src/components/admin/features/restaurant/restaurantSettingsEditor.tsx` to unify action buttons and form submit logic
- [ ] Modify schedule tab `src/components/admin/features/restaurant/openingHoursTab.tsx` to remove duplicate footers, fix day toggle bug, and map indexes safely
- [ ] Modify Sanity schema `src/sanity/schemaTypes/openingHours.ts` to include 24-hour validation rules
- [ ] Verify and check typescript compilation with `npm run build`
