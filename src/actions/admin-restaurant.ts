"use server";

import { assertAdmin, checkAdmin } from "@/lib/auth-guard";
import { RestaurantDetails, ScheduleSummary } from "@/types/admin";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { ServiceError } from "@/lib/services/errors";
import {
  fetchAdminRestaurantsService,
  fetchRestaurantDetailsService,
  fetchAllSchedulesService,
  assignScheduleToRestaurantService,
  createAndLinkScheduleService,
  deleteScheduleService,
  toggleRestaurantActiveService,
  uploadRestaurantImageService,
  saveRestaurantDetailsService,
  saveOpeningHoursService,
} from "@/lib/services/admin.restaurant.service";

// Zod Input Validation Schemas
const ToggleActiveSchema = z.object({
  restaurantId: z.string().trim().min(1),
  isActive: z.boolean(),
});

const SaveDetailsSchema = z.object({
  restaurantId: z.string().trim().min(1),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  slug: z.string().trim().min(2, "Slug must be at least 2 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),
  phone: z.string().trim().min(5, "Phone number is required"),
  email: z.email("Invalid email address").trim(),
  location: z.object({
    address: z.string().trim().min(1, "Address is required"),
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
  imageAssetId: z.string().trim().optional(),
});

const SaveHoursSchema = z.object({
  openingHoursId: z.string().trim().min(1),
  name: z.string().trim().min(1, "Schedule name is required"),
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

export async function fetchAdminRestaurants(options?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  featured?: string;
}): Promise<{ restaurants: RestaurantDetails[]; totalItems: number }> {
  await checkAdmin();
  try {
    return await fetchAdminRestaurantsService(options);
  } catch (error) {
    console.error("Failed to fetch admin restaurants:", error);
    return { restaurants: [], totalItems: 0 };
  }
}

export async function fetchRestaurantDetails(
  id: string,
): Promise<RestaurantDetails | null> {
  await checkAdmin();
  try {
    return await fetchRestaurantDetailsService(id);
  } catch (error) {
    console.error(`Failed to fetch restaurant details for ${id}:`, error);
    return null;
  }
}

export async function fetchAllSchedules(): Promise<ScheduleSummary[]> {
  await checkAdmin();
  try {
    return await fetchAllSchedulesService();
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return [];
  }
}

export async function assignScheduleToRestaurantAction(
  restaurantId: string,
  openingHoursId: string,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  
  try {
    await assignScheduleToRestaurantService(restaurantId, openingHoursId);
    
    // @ts-ignore
    revalidateTag("restaurant", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error(`Failed to assign schedule ${openingHoursId} to restaurant ${restaurantId}:`, error);
    return { success: false, error: "Failed to link schedule." };
  }
}

export async function createAndLinkScheduleAction(
  restaurantId: string,
  name: string,
): Promise<{ success: boolean; error?: string; openingHoursId?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  
  try {
    const newDocId = await createAndLinkScheduleService(restaurantId, name);

    // @ts-ignore
    revalidateTag("restaurant", "max");
    return { success: true, openingHoursId: newDocId };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error(`Failed to create and link schedule for restaurant ${restaurantId}:`, error);
    return { success: false, error: "Failed to create new schedule." };
  }
}

export async function deleteScheduleAction(
  openingHoursId: string,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;
  
  try {
    await deleteScheduleService(openingHoursId);

    // @ts-ignore
    revalidateTag("restaurant", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error(`Failed to delete schedule template ${openingHoursId}:`, error);
    return { success: false, error: "Failed to delete schedule template." };
  }
}

export async function toggleRestaurantActiveAction(
  rawInput: unknown,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;

  const result = ToggleActiveSchema.safeParse(rawInput);
  if (!result.success) {
    return { success: false, error: "Invalid parameters." };
  }

  const { restaurantId, isActive } = result.data;
  
  try {
    await toggleRestaurantActiveService(restaurantId, isActive);
    
    // @ts-ignore
    revalidateTag("restaurant", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error(`Failed to toggle status for restaurant ${restaurantId}:`, error);
    return { success: false, error: "Failed to update restaurant status." };
  }
}

export async function uploadRestaurantImageAction(
  formData: FormData,
): Promise<{ success: boolean; error?: string; assetId?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;

  try {
    const file = formData.get("image") as File;
    if (!file) {
      return { success: false, error: "No image file provided." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const assetId = await uploadRestaurantImageService(buffer, file);

    return { success: true, assetId };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error("Failed to upload restaurant image:", error);
    return { success: false, error: "Image upload failed." };
  }
}

export async function saveRestaurantDetailsAction(
  rawInput: unknown,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;

  const result = SaveDetailsSchema.safeParse(rawInput);
  if (!result.success) {
    const errorMsg = result.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return { success: false, error: errorMsg };
  }

  try {
    await saveRestaurantDetailsService(result.data);
    
    // @ts-ignore
    revalidateTag("restaurant", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error(`Failed to save restaurant details for ${result.data.restaurantId}:`, error);
    return { success: false, error: "Failed to update restaurant profile." };
  }
}

export async function saveOpeningHoursAction(
  rawInput: unknown,
): Promise<{ success: boolean; error?: string }> {
  const guard = await assertAdmin();
  if (!guard.success) return guard;

  const result = SaveHoursSchema.safeParse(rawInput);
  if (!result.success) {
    return { success: false, error: "Invalid schedule format." };
  }

  try {
    await saveOpeningHoursService(result.data);
    
    // @ts-ignore
    revalidateTag("restaurant", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ServiceError) {
      return { success: false, error: error.message };
    }
    console.error(`Failed to update opening hours ${result.data.openingHoursId}:`, error);
    return {
      success: false,
      error: "Failed to update opening hours schedule.",
    };
  }
}
