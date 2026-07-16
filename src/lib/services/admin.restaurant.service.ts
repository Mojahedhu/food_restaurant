import { client, writeClient } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { RestaurantDetails, ScheduleSummary } from "@/types/admin";
import { groq } from "next-sanity";
import { ServiceError } from "./errors";

interface FetchRestaurantsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  featured?: string;
}

export async function fetchAdminRestaurantsService(
  options?: FetchRestaurantsParams
): Promise<{ restaurants: RestaurantDetails[]; totalItems: number }> {
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 5;
  const search = options?.search?.trim() || "";
  const status = options?.status || "all";
  const featured = options?.featured || "all";

  const filters = [`_type == "restaurant"`];
  const params: Record<string, string | number> = {};

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
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

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
}

export async function fetchRestaurantDetailsService(
  id: string
): Promise<RestaurantDetails | null> {
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
}

export async function fetchAllSchedulesService(): Promise<ScheduleSummary[]> {
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
}

export async function assignScheduleToRestaurantService(
  restaurantId: string,
  openingHoursId: string
) {
  await writeClient
    .patch(restaurantId)
    .set({
      openingHours: {
        _type: "reference",
        _ref: openingHoursId,
      },
    })
    .commit();
}

export async function createAndLinkScheduleService(
  restaurantId: string,
  name: string
): Promise<string> {
  if (name.trim().toLowerCase() === "standard hours") {
    throw new ServiceError("Cannot create a new template named 'Standard Hours'.");
  }

  const defaultSchedule = [
    { _key: "monday", day: "monday", openTime: "09:00", closeTime: "23:00", isClosed: false },
    { _key: "tuesday", day: "tuesday", openTime: "09:00", closeTime: "23:00", isClosed: false },
    { _key: "wednesday", day: "wednesday", openTime: "09:00", closeTime: "23:00", isClosed: false },
    { _key: "thursday", day: "thursday", openTime: "09:00", closeTime: "23:00", isClosed: false },
    { _key: "friday", day: "friday", openTime: "09:00", closeTime: "23:00", isClosed: false },
    { _key: "saturday", day: "saturday", openTime: "09:00", closeTime: "23:00", isClosed: false },
    { _key: "sunday", day: "sunday", openTime: "09:00", closeTime: "23:00", isClosed: false },
  ];

  const newDoc = await writeClient.create({
    _type: "openingHours",
    name,
    schedule: defaultSchedule,
  });

  await writeClient
    .patch(restaurantId)
    .set({
      openingHours: {
        _type: "reference",
        _ref: newDoc._id,
      },
    })
    .commit();

  return newDoc._id;
}

export async function deleteScheduleService(openingHoursId: string) {
  const currentDoc = (await writeClient.getDocument(openingHoursId)) as {
    _id: string;
    name: string;
  };
  
  if (!currentDoc) {
    throw new ServiceError("Schedule template not found.");
  }

  if (currentDoc.name.trim().toLowerCase() === "standard hours") {
    throw new ServiceError("The 'Standard Hours' template cannot be deleted.");
  }

  const standardHours = await writeClient.fetch(
    groq`*[_type == "openingHours" && name == "Standard Hours"][0] { _id }`
  );
  
  if (!standardHours?._id) {
    throw new ServiceError("Standard Hours template not found in database. Cannot delete.");
  }
  
  const standardHoursId = standardHours._id as string;

  const affectedRestaurants = (await writeClient.fetch(
    groq`*[_type == "restaurant" && openingHours._ref == $openingHoursId] { _id }`,
    { openingHoursId }
  )) as { _id: string }[];

  const transaction = writeClient.transaction();

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

  transaction.delete(openingHoursId);
  await transaction.commit();
}

export async function toggleRestaurantActiveService(
  restaurantId: string,
  isActive: boolean
) {
  await writeClient.patch(restaurantId).set({ isActive }).commit();
}

export async function uploadRestaurantImageService(buffer: Buffer, file: File): Promise<string> {
  const asset = await writeClient.assets.upload("image", buffer, {
    filename: file.name,
    contentType: file.type,
  });
  return asset._id;
}

export async function saveRestaurantDetailsService(data: any) {
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
  } = data;

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
}

export async function saveOpeningHoursService(data: any) {
  const { openingHoursId, name, schedule } = data;

  const currentDoc = (await writeClient.getDocument(openingHoursId)) as {
    _id: string;
    name: string;
  };
  
  if (!currentDoc) {
    throw new ServiceError("Schedule template not found.");
  }

  const isCurrentStandard = currentDoc.name.trim().toLowerCase() === "standard hours";
  const isNewStandard = name.trim().toLowerCase() === "standard hours";

  if (isCurrentStandard && !isNewStandard) {
    throw new ServiceError("The 'Standard Hours' template cannot be renamed.");
  }

  if (!isCurrentStandard && isNewStandard) {
    throw new ServiceError("Cannot rename a template to 'Standard Hours'.");
  }

  await writeClient.patch(openingHoursId).set({ name, schedule }).commit();
}
