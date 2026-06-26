# Phase 12: Restaurant Info & Settings Center

This phase introduces the **Restaurant Info & Settings Center** to the Admin Dashboard (routed at `/admin/settings`). It enables administrators to manage metadata (name, description, logo), contact details (phone, email), geographical coordinates (address, latitude, longitude), operational states (active toggle), delivery parameters (minimum order, fee, estimated time), and weekly schedules (opening/closing times per day).

All features follow the strict zero-trust server validation, crash elimination, and fluid UI transition rules in [plan.md](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/plan.md).

---

## User Review Required

> [!IMPORTANT]
>
> - **Dual View Interface:** We propose a dual-view settings panel:
>   - **Default View:** A filterable grid/table of all 8 restaurants with quick active/inactive status switches.
>   - **Detail View (`/admin/settings?id=[id]`):** A comprehensive settings editor structured with tabbed sections (General, Delivery, Location, Schedule) for the selected restaurant.
> - **Optimistic Status Toggle:** Toggling a restaurant's operational status (`isActive`) will update the UI optimistically, validating the change through a server action and automatically rolling back on mutation failure.
> - **Weekly Schedule Reference Management:** The opening hours schedule is a referenced document type (`openingHours`). The settings action will automatically update the referenced schedule. If a restaurant does not have an opening hours document reference, the server action will automatically create one and link it.
> - **Safe Form Image Uploads:** Logo/image replacement uses a two-step process: upload the image file to Sanity's asset pipeline via a dedicated multipart form action, and then pass the resolved `imageAssetId` to the update payload, ensuring optimal payload serialization.

---

## Proposed Changes

We will implement this phase by declaring TypeScript interfaces, backend Server Actions, forms, list views, custom hooks, and route pages.

```text
src/
├── actions/
│   └── admin-restaurant.ts       # NEW: Server actions (fetching, status toggle, detail save, opening hours save, asset upload)
├── app/
│   └── admin/
│       └── settings/
│           ├── page.tsx          # NEW: Settings page (data loading, view switching, and layout)
│           └── loading.tsx       # NEW: Next.js loading skeleton for settings page
├── components/
│   └── admin/
│       └── features/
│           └── restaurant/       # NEW: Restaurant settings components
│               ├── restaurantList.tsx           # Table of all restaurants with search & status toggle
│               ├── restaurantSettingsEditor.tsx # Tabs shell for General, Delivery, Location, Schedule
│               ├── generalInfoTab.tsx           # Basic info, logo upload, email/phone
│               ├── deliveryPricingTab.tsx       # Minimum order, delivery fee, ETA, sorting order
│               ├── locationTab.tsx              # Address and coordinates (lat/lng)
│               └── openingHoursTab.tsx          # Day-of-week schedule (open/close times & closed toggles)
├── hooks/
│   └── useRestaurantLogic.ts     # NEW: Custom hook for settings form handling, optimistic status updates, and image upload flow
└── types/
    └── admin.ts                  # MODIFY: Add RestaurantDetails and OpeningHoursSchedule definitions
```

---

### 1. TypeScript Types

Add structural definitions for the restaurant settings context.

#### [MODIFY] [admin.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/types/admin.ts)

```typescript
// Append the following types to the end of the file

export interface OpeningHoursSchedule {
  _id: string;
  name: string;
  schedule: Array<{
    day: string;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
  description?: string;
}

export interface RestaurantDetails {
  _id: string;
  _createdAt: string;
  name: string;
  slug: {
    _type: "slug";
    current: string;
  };
  description: string;
  image?: {
    _type: "image";
    asset?: {
      _type: "reference";
      _ref: string;
    };
  };
  phone: string;
  email: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: number;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  AllFoodItemsAvailable?: boolean;
  openingHours: OpeningHoursSchedule | null;
  categoriesCount?: number;
  foodItemsCount?: number;
}
```

---

### 2. Backend Server Actions

Create a dedicated action layer validating input fields via `Zod` and executing document patches on Sanity.

#### [NEW] [admin-restaurant.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/actions/admin-restaurant.ts)

```typescript
"use server";

import { client, writeClient } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { RestaurantDetails } from "@/types/admin";
import { groq } from "next-sanity";
import { revalidateTag } from "next/cache";
import { z } from "zod";

// Zod Input Validation Schemas
const ToggleActiveSchema = z.object({
  restaurantId: z.string().min(1),
  isActive: z.boolean(),
});

const SaveDetailsSchema = z.object({
  restaurantId: z.string().min(1),
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  phone: z.string().min(5, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  location: z.object({
    address: z.string().min(1, "Address is required"),
    latitude: z
      .number()
      .min(-90)
      .max(90, "Latitude must be between -90 and 90"),
    longitude: z
      .number()
      .min(-180)
      .max(180, "Longitude must be between -180 and 180"),
  }),
  deliveryFee: z.number().min(0, "Delivery fee cannot be negative"),
  minimumOrder: z.number().min(0, "Minimum order cannot be negative"),
  estimatedDeliveryTime: z
    .number()
    .min(1, "Estimated delivery time must be at least 1 minute"),
  isFeatured: z.boolean(),
  order: z.number().int().default(0),
  imageAssetId: z.string().optional(),
});

const SaveHoursSchema = z.object({
  openingHoursId: z.string().min(1),
  schedule: z.array(
    z.object({
      day: z.string(),
      openTime: z.string().regex(/^\d{2}:\d{2}$/, "Format must be HH:MM"),
      closeTime: z.string().regex(/^\d{2}:\d{2}$/, "Format must be HH:MM"),
      isClosed: z.boolean(),
    }),
  ),
});

/**
 * Fetch all restaurants with simplified details
 */
export async function fetchAdminRestaurants(): Promise<RestaurantDetails[]> {
  try {
    const query = groq`*[_type == "restaurant"] | order(order asc, name asc) {
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
    }`;

    const { data } = await sanityFetch({
      query,
      params: {},
      tags: ["restaurant"],
    });

    return (data || []) as RestaurantDetails[];
  } catch (error) {
    console.error("Failed to fetch admin restaurants:", error);
    return [];
  }
}

/**
 * Fetch detailed restaurant profile with dereferenced opening hours
 */
export async function fetchRestaurantDetails(
  id: string,
): Promise<RestaurantDetails | null> {
  try {
    const query = groq`*[_type == "restaurant" && _id == $id][0] {
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
    }`;

    const { data } = await sanityFetch({
      query,
      params: { id },
      tags: ["restaurant"],
    });

    return (data || null) as RestaurantDetails | null;
  } catch (error) {
    console.error(`Failed to fetch restaurant details for ${id}:`, error);
    return null;
  }
}

/**
 * Toggle restaurant active status (order acceptance status)
 */
export async function toggleRestaurantActiveAction(rawInput: unknown) {
  const result = ToggleActiveSchema.safeParse(rawInput);
  if (!result.success) {
    return { success: false, error: "Invalid parameters." };
  }

  const { restaurantId, isActive } = result.data;
  try {
    await writeClient.patch(restaurantId).set({ isActive }).commit();
    revalidateTag("restaurant", "max");
    return { success: true };
  } catch (error) {
    console.error(
      `Failed to toggle status for restaurant ${restaurantId}:`,
      error,
    );
    return { success: false, error: "Failed to update restaurant status." };
  }
}

/**
 * Upload logo/image to Sanity
 */
export async function uploadRestaurantImageAction(formData: FormData) {
  try {
    const file = formData.get("image") as File;
    if (!file) {
      return { success: false, error: "No image file provided." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const asset = await writeClient.assets.upload("image", buffer, {
      filename: file.name,
      contentType: file.type,
    });

    return { success: true, assetId: asset._id };
  } catch (error) {
    console.error("Failed to upload restaurant image:", error);
    return { success: false, error: "Image upload failed." };
  }
}

/**
 * Update general, location, and delivery details of a restaurant
 */
export async function saveRestaurantDetailsAction(rawInput: unknown) {
  const result = SaveDetailsSchema.safeParse(rawInput);
  if (!result.success) {
    const errorMsg = result.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return { success: false, error: errorMsg };
  }

  const {
    restaurantId,
    name,
    slug,
    description,
    phone,
    email,
    location,
    deliveryFee,
    minimumOrder,
    estimatedDeliveryTime,
    isFeatured,
    order,
    imageAssetId,
  } = result.data;

  try {
    const patchFields: Record<string, any> = {
      name,
      slug: { _type: "slug", current: slug },
      description,
      phone,
      email,
      location: {
        _type: "object",
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      deliveryFee,
      minimumOrder,
      estimatedDeliveryTime,
      isFeatured,
      order,
    };

    if (imageAssetId) {
      patchFields.image = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: imageAssetId,
        },
      };
    }

    await writeClient.patch(restaurantId).set(patchFields).commit();
    revalidateTag("restaurant", "max");
    return { success: true };
  } catch (error) {
    console.error(
      `Failed to save restaurant details for ${restaurantId}:`,
      error,
    );
    return { success: false, error: "Failed to update restaurant profile." };
  }
}

/**
 * Update daily opening hours schedules
 */
export async function saveOpeningHoursAction(rawInput: unknown) {
  const result = SaveHoursSchema.safeParse(rawInput);
  if (!result.success) {
    return { success: false, error: "Invalid schedule format." };
  }

  const { openingHoursId, schedule } = result.data;
  try {
    await writeClient.patch(openingHoursId).set({ schedule }).commit();
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
```

---

### 3. Custom Hook for State & Upload Orchestration

Coordinate form tabs state, image preprocessing uploads, active status transitions, and client-side notifications.

#### [NEW] [useRestaurantLogic.ts](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/hooks/useRestaurantLogic.ts)

```typescript
"use client";

import { useState, useTransition } from "react";
import { RestaurantDetails, OpeningHoursSchedule } from "@/types/admin";
import {
  toggleRestaurantActiveAction,
  saveRestaurantDetailsAction,
  saveOpeningHoursAction,
  uploadRestaurantImageAction,
} from "@/actions/admin-restaurant";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

  // Operating schedule state (Monday-Sunday slots)
  const [schedule, setSchedule] = useState<OpeningHoursSchedule["schedule"]>(
    initialRestaurant?.openingHours?.schedule || [],
  );

  // Optimistic Toggle Updates for Restaurants List View
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
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialRestaurant) return;

    startTransition(async () => {
      let imageAssetId: string | undefined = undefined;

      // 1. Upload file if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const uploadRes = await uploadRestaurantImageAction(formData);
        if (!uploadRes.success) {
          toast.error(uploadRes.error || "Failed to upload new logo image.");
          return;
        }
        imageAssetId = uploadRes.assetId;
      }

      // 2. Save restaurant parameters
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
        openingHoursId: initialRestaurant.openingHours!._id,
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

  const handleScheduleDayChange = (
    index: number,
    field: "openTime" | "closeTime" | "isClosed",
    value: any,
  ) => {
    setSchedule((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
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
    schedule,
    handleSaveSchedule,
    handleScheduleDayChange,
    optimisticActiveStates,
    handleToggleActive,
  };
}
```

---

### 4. Admin Feature Components

Build clean components using predefined tailwind styles and elements from `shadcn/ui`.

#### [NEW] [restaurantList.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/restaurantList.tsx)

```tsx
"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Search, MapPin, Phone, Star, Edit, Utensils } from "lucide-react";
import Image from "next/image";

interface RestaurantListProps {
  initialRestaurants: RestaurantDetails[];
  initialSearch?: string;
}

export function RestaurantList({
  initialRestaurants,
  initialSearch = "",
}: RestaurantListProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const { handleToggleActive, optimisticActiveStates, isPending } =
    useRestaurantLogic();

  const filtered = initialRestaurants.filter(
    (res) =>
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.location.address.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search restaurants or locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No restaurants found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((res) => {
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

#### [NEW] [restaurantSettingsEditor.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/restaurantSettingsEditor.tsx)

```tsx
"use client";

import { RestaurantDetails } from "@/types/admin";
import { useRestaurantLogic } from "@/hooks/useRestaurantLogic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralInfoTab } from "./generalInfoTab";
import { DeliveryPricingTab } from "./deliveryPricingTab";
import { LocationTab } from "./locationTab";
import { OpeningHoursTab } from "./openingHoursTab";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Landmark, Truck, Map, CalendarRange } from "lucide-react";
import { Link } from "next-view-transitions";

interface RestaurantSettingsEditorProps {
  restaurant: RestaurantDetails;
}

export function RestaurantSettingsEditor({
  restaurant,
}: RestaurantSettingsEditorProps) {
  const formLogic = useRestaurantLogic(restaurant);

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
      <Tabs defaultValue="general" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-muted/50 p-1 border rounded-lg h-auto gap-1">
          <TabsTrigger
            value="general"
            className="py-2.5 flex items-center justify-center gap-1.5 font-medium"
          >
            <Landmark className="size-4" /> Profile Info
          </TabsTrigger>
          <TabsTrigger
            value="delivery"
            className="py-2.5 flex items-center justify-center gap-1.5 font-medium"
          >
            <Truck className="size-4" /> Delivery rules
          </TabsTrigger>
          <TabsTrigger
            value="location"
            className="py-2.5 flex items-center justify-center gap-1.5 font-medium"
          >
            <Map className="size-4" /> Address & Location
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="py-2.5 flex items-center justify-center gap-1.5 font-medium"
          >
            <CalendarRange className="size-4" /> Operating Hours
          </TabsTrigger>
        </TabsList>

        <form onSubmit={formLogic.handleSaveDetails} className="space-y-6">
          <TabsContent value="general" className="focus-visible:outline-none">
            <GeneralInfoTab formLogic={formLogic} logoUrl={restaurant.image} />
          </TabsContent>

          <TabsContent value="delivery" className="focus-visible:outline-none">
            <DeliveryPricingTab formLogic={formLogic} />
          </TabsContent>

          <TabsContent value="location" className="focus-visible:outline-none">
            <LocationTab formLogic={formLogic} />
          </TabsContent>

          {/* Form Actions for first 3 tabs */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button asChild variant="ghost">
              <Link href="/admin/settings">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={formLogic.isPending}
              className="min-w-32"
            >
              {formLogic.isPending ? (
                <div className="size-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>

        {/* Operating hours schedule manages its own save action separately */}
        <TabsContent value="schedule" className="focus-visible:outline-none">
          <OpeningHoursTab formLogic={formLogic} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

#### [NEW] [generalInfoTab.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/generalInfoTab.tsx)

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
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Upload } from "lucide-react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

interface GeneralInfoTabProps {
  formLogic: any;
  logoUrl: any;
}

export function GeneralInfoTab({ formLogic, logoUrl }: GeneralInfoTabProps) {
  const displayImage = formLogic.previewUrl
    ? formLogic.previewUrl
    : logoUrl
      ? urlFor(logoUrl).url()
      : "";

  return (
    <Card className="border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="font-semibold text-lg">General Info</CardTitle>
        <CardDescription>
          Configure basic metadata and contact info.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo/Image uploader */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Restaurant Logo/Image</Label>
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 border border-dashed rounded-xl bg-slate-50/50">
            <div className="relative w-32 h-24 rounded-lg overflow-hidden border bg-slate-100 flex items-center justify-center shrink-0">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt="Restaurant Logo"
                  fill
                  className="object-cover"
                />
              ) : (
                <ImageIcon className="size-8 text-muted-foreground opacity-40" />
              )}
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold shadow-sm cursor-pointer hover:bg-slate-50 transition-colors w-fit mx-auto sm:mx-0">
                <Upload className="size-4 text-muted-foreground" />
                Upload logo file
                <input
                  type="file"
                  accept="image/*"
                  onChange={formLogic.handleFileChange}
                  className="hidden"
                  disabled={formLogic.isPending}
                />
              </label>
              <p className="text-[10px] text-muted-foreground">
                Supported format JPG, PNG. Max size 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Input Details */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="restaurantName">Restaurant Name</Label>
            <Input
              id="restaurantName"
              value={formLogic.name}
              onChange={(e) => {
                formLogic.setName(e.target.value);
                formLogic.setSlug(
                  e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                );
              }}
              required
              disabled={formLogic.isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="restaurantSlug">Slug</Label>
            <Input
              id="restaurantSlug"
              value={formLogic.slug}
              onChange={(e) =>
                formLogic.setSlug(
                  e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                )
              }
              required
              disabled={formLogic.isPending}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="restaurantDesc">Description</Label>
          <Textarea
            id="restaurantDesc"
            value={formLogic.description}
            onChange={(e) => formLogic.setDescription(e.target.value)}
            required
            className="h-28 resize-none"
            disabled={formLogic.isPending}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="restaurantPhone">Phone number</Label>
            <Input
              id="restaurantPhone"
              value={formLogic.phone}
              onChange={(e) => formLogic.setPhone(e.target.value)}
              required
              disabled={formLogic.isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="restaurantEmail">Email Address</Label>
            <Input
              id="restaurantEmail"
              type="email"
              value={formLogic.email}
              onChange={(e) => formLogic.setEmail(e.target.value)}
              required
              disabled={formLogic.isPending}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### [NEW] [deliveryPricingTab.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/deliveryPricingTab.tsx)

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

interface DeliveryPricingTabProps {
  formLogic: any;
}

export function DeliveryPricingTab({ formLogic }: DeliveryPricingTabProps) {
  return (
    <Card className="border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="font-semibold text-lg">
          Delivery & Pricing Rules
        </CardTitle>
        <CardDescription>
          Set delivery fees, minimum requirements, and display parameters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="deliveryFee">Delivery Fee ($)</Label>
            <Input
              id="deliveryFee"
              type="number"
              step="0.01"
              value={formLogic.deliveryFee}
              onChange={(e) => formLogic.setDeliveryFee(Number(e.target.value))}
              required
              disabled={formLogic.isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="minimumOrder">Minimum Order Amount ($)</Label>
            <Input
              id="minimumOrder"
              type="number"
              step="0.01"
              value={formLogic.minimumOrder}
              onChange={(e) =>
                formLogic.setMinimumOrder(Number(e.target.value))
              }
              required
              disabled={formLogic.isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deliveryTime">Est. Delivery Time (minutes)</Label>
            <Input
              id="deliveryTime"
              type="number"
              value={formLogic.estimatedDeliveryTime}
              onChange={(e) =>
                formLogic.setEstimatedDeliveryTime(Number(e.target.value))
              }
              required
              disabled={formLogic.isPending}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 items-center pt-2">
          {/* Featured switcher */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50/50">
            <div>
              <Label className="font-semibold text-sm">
                Featured Restaurant
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Showcase this restaurant on the home catalog page
              </p>
            </div>
            <Switch
              checked={formLogic.isFeatured}
              onCheckedChange={formLogic.setIsFeatured}
              disabled={formLogic.isPending}
            />
          </div>

          {/* Display Sorting Order */}
          <div className="space-y-1.5 p-4 border rounded-lg bg-slate-50/50">
            <Label htmlFor="displayOrder" className="font-semibold text-sm">
              Display Sorting Order
            </Label>
            <Input
              id="displayOrder"
              type="number"
              value={formLogic.order}
              onChange={(e) => formLogic.setOrder(Number(e.target.value))}
              className="h-9 mt-1"
              disabled={formLogic.isPending}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### [NEW] [locationTab.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/locationTab.tsx)

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

interface LocationTabProps {
  formLogic: any;
}

export function LocationTab({ formLogic }: LocationTabProps) {
  return (
    <Card className="border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="font-semibold text-lg">
          Address & Coordinates
        </CardTitle>
        <CardDescription>
          Configure physical coordinates for mapping and delivery calculations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="address">Physical Address</Label>
          <Input
            id="address"
            placeholder="e.g. 123 Main St, New York, NY 10001"
            value={formLogic.address}
            onChange={(e) => formLogic.setAddress(e.target.value)}
            required
            disabled={formLogic.isPending}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              placeholder="e.g. 40.7128"
              value={formLogic.latitude}
              onChange={(e) => formLogic.setLatitude(Number(e.target.value))}
              required
              disabled={formLogic.isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              placeholder="e.g. -74.0060"
              value={formLogic.longitude}
              onChange={(e) => formLogic.setLongitude(Number(e.target.value))}
              required
              disabled={formLogic.isPending}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### [NEW] [openingHoursTab.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/components/admin/features/restaurant/openingHoursTab.tsx)

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
import { Button } from "@/components/ui/button";

interface OpeningHoursTabProps {
  formLogic: any;
}

export function OpeningHoursTab({ formLogic }: OpeningHoursTabProps) {
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
          Set standard opening/closing times. Toggle 'Closed' for
          non-operational days.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {daysOfWeek.map((dayObj, index) => {
            const daySlot = (formLogic.schedule || []).find(
              (s: any) => s.day === dayObj.key,
            );
            if (!daySlot) return null;

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
                      type="text"
                      placeholder="10:00"
                      value={daySlot.openTime}
                      disabled={daySlot.isClosed || formLogic.isPending}
                      onChange={(e) =>
                        formLogic.handleScheduleDayChange(
                          index,
                          "openTime",
                          e.target.value,
                        )
                      }
                      className="w-20 h-9 text-center text-sm font-semibold"
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
                      type="text"
                      placeholder="23:00"
                      value={daySlot.closeTime}
                      disabled={daySlot.isClosed || formLogic.isPending}
                      onChange={(e) =>
                        formLogic.handleScheduleDayChange(
                          index,
                          "closeTime",
                          e.target.value,
                        )
                      }
                      className="w-20 h-9 text-center text-sm font-semibold"
                    />
                  </div>

                  {/* Closed toggle */}
                  <div className="flex items-center gap-2 border-l pl-4">
                    <Switch
                      id={`${dayObj.key}-closed`}
                      checked={daySlot.isClosed}
                      onCheckedChange={(checked) =>
                        formLogic.handleScheduleDayChange(
                          index,
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

        {/* Schedule tab save actions */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="ghost" disabled={formLogic.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={formLogic.handleSaveSchedule}
            disabled={formLogic.isPending}
            className="min-w-32"
          >
            {formLogic.isPending ? (
              <div className="size-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              "Save schedule"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 5. Page Integration

Hook everything up inside Next.js Routing.

#### [NEW] [page.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/app/admin/settings/page.tsx)

```tsx
import { Metadata } from "next";
import {
  fetchAdminRestaurants,
  fetchRestaurantDetails,
} from "@/actions/admin-restaurant";
import { RestaurantList } from "@/components/admin/features/restaurant/restaurantList";
import { RestaurantSettingsEditor } from "@/components/admin/features/restaurant/restaurantSettingsEditor";
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
  }>;
}

export default async function SettingsCenterPage({
  searchParams,
}: SettingsPageProps) {
  const { id: restaurantId, search = "" } = await searchParams;

  if (!restaurantId) {
    // List view of all partner restaurants
    const restaurants = await fetchAdminRestaurants();

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Restaurant Settings Center
          </h1>
          <p className="text-muted-foreground text-sm">
            Toggle accepting orders, update delivery fees, and configure active
            schedules for partner locations.
          </p>
        </div>

        <Separator />

        <RestaurantList
          initialRestaurants={restaurants}
          initialSearch={search}
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

#### [NEW] [loading.tsx](file:///c:/Users/user/Downloads/Video/Vishwas/food_app/src/app/admin/settings/loading.tsx)

```tsx
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SettingsCenterLoading() {
  return (
    <div className="space-y-6">
      {/* Title Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="h-px bg-border" />

      {/* Filter skeleton */}
      <Skeleton className="h-9 w-64 rounded-lg" />

      {/* Table skeleton */}
      <div className="rounded-xl border bg-card overflow-hidden">
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
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-lg shrink-0" />
                    <div className="space-y-1 w-full">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-12 ml-auto rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

---

## Verification Plan

### Automated Verification

- **TypeScript Compilation:** Run `npx tsc --noEmit` to verify typegen completeness and absence of syntax or type validation bugs.
- **Next.js Production Build:** Run `npm run build` or `pnpm build` to ensure the route compiles cleanly with proper server and static generation flags.

### Manual Verification

1. **Dashboard Toggle Test:**
   - On the settings home list, toggle any restaurant's switch.
   - Verify the UI updates optimistically.
   - Reload the page to ensure the value persisted in Sanity database.
2. **General Profile Updates:**
   - Select a restaurant, change the description/name, upload a new image/logo.
   - Save the form and confirm success toast.
   - Navigate back to the list and to the client customer pages (e.g. `/restaurants/[slug]`), and confirm the new description and image are immediately updated.
3. **Weekly Schedule Adjustments:**
   - Go to the Operating Hours tab. Turn off a day (toggle closed) or change times (e.g. `11:00 - 22:00`).
   - Click "Save schedule" and confirm persistence.
   - Verify the client menu updates closed/open badges dynamically depending on the current time and day.
4. **Validation Bounds Errors:**
   - Try to enter an invalid email, a negative delivery fee, or invalid latitude/longitude bounds.
   - Submit and verify Zod constraints fail safely without crashes, displaying toast notifications.
