"use server";

import { writeClient } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { RestaurantDetails, ScheduleSummary } from "@/types/admin";
import { groq } from "next-sanity";
import { revalidateTag } from "next/cache";
import { ValueOf } from "next/dist/shared/lib/constants";
import { z } from "zod";

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
 * Fetch all restaurants with simplified details
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
    const params: Record<string, string> = {};

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
      },
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
    const res = data as {
      restaurants: RestaurantDetails[];
      totalItems: number;
    };
    return {
      restaurants: (res.restaurants || []) as RestaurantDetails[],
      totalItems: res.totalItems || 0,
    };
  } catch (error) {
    console.error("Failed to fetch admin restaurants:", error);
    return { restaurants: [], totalItems: 0 };
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
    await writeClient
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
    if (name.trim().toLowerCase() === "standard hours") {
      return {
        success: false,
        error: "Cannot create a new template named 'Standard Hours'.",
      };
    }

    // 1. Create schedule document with standard default hours
    // In src/actions/admin-restaurant.ts -> createAndLinkScheduleAction
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
    const currentDoc = (await writeClient.getDocument(openingHoursId)) as {
      _id: string;
      name: string;
    };
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
    const standardHoursId = standardHours._id as string;

    // 3. Find all restaurants referencing this custom template
    const affectedRestaurants = (await writeClient.fetch(
      groq`*[_type == "restaurant" && openingHours._ref == $openingHoursId] { _id }`,
      { openingHoursId },
    )) as {
      _id: string;
    }[];

    const transaction = writeClient.transaction();

    // 4. Update all affected restaurants to Standard Hours reference
    if (affectedRestaurants && affectedRestaurants.length > 0) {
      affectedRestaurants.forEach((res) => {
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
    const patchFields: Record<string, ValueOf<RestaurantDetails>> = {
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

  const { openingHoursId, name, schedule } = result.data;
  try {
    // 1. Fetch current document to check name restrictions
    const currentDoc = (await writeClient.getDocument(openingHoursId)) as {
      _id: string;
      name: string;
    };
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
