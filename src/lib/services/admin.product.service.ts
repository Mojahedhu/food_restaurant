import { client, writeClient } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { ProductSummary } from "@/types/admin";
import { groq } from "next-sanity";
import { ServiceError } from "./errors";

interface FetchProductsParams {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  available?: string;
}

export async function fetchAllVarietiesService() {
  const query = groq`*[_type == "foodVariety"] | order(name asc) { _id, name }`;
  const { data } = await sanityFetch({
    query,
    params: {},
    tags: ["varieties"],
  });
  return data as Array<{ _id: string; name: string }>;
}

export async function fetchAllSizesService() {
  const query = groq`*[_type == "size"] | order(name asc) { _id, name }`;
  const { data } = await sanityFetch({ query, params: {}, tags: ["sizes"] });
  return data as Array<{ _id: string; name: string }>;
}

export async function fetchAllIngredientsService() {
  const query = groq`*[_type == "ingredient"] | order(name asc) { _id, name }`;
  const { data } = await sanityFetch({
    query,
    params: {},
    tags: ["ingredients"],
  });
  return data as Array<{ _id: string; name: string }>;
}

export async function fetchAdminProductsPagedService({
  page,
  pageSize,
  search = "",
  category = "",
  available = "",
}: FetchProductsParams) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  let filterClauses = `_type == "food"`;
  const params: Record<string, string | number> = { start, end };

  if (search.trim()) {
    filterClauses += ` && name match $search`;
    params.search = `*${search.trim()}*`;
  }

  if (category && category !== "all") {
    filterClauses += ` && category._ref == $category`;
    params.category = category;
  }

  if (available === "true") {
    filterClauses += ` && available == true`;
  } else if (available === "false") {
    filterClauses += ` && available == false`;
  }

  const countQuery = groq`count(*[${filterClauses}])`;
  const dataQuery = groq`
    *[${filterClauses}] | order(name asc) {
      _id,
      _createdAt,
      name,
      price,
      order,
      available,
      description,
      preparationTime,
      spiceLevel,
      enableAllSizes,
      featured,
      category->{
        _id,
        name
      },
      images[] {
        asset-> {
          _id,
          url
        }
      },
      "sizes": sizes[].size->{
        _id,
        name
      },
      varieties[]->{
        _id,
        name
      },
      ingredients[]->{
        _id,
        name
      }
    }[$start...$end]
  `;

  const [{ data: totalItems }, { data: products }] = await Promise.all([
    sanityFetch({ query: countQuery, params, tags: ["products"] }),
    sanityFetch({ query: dataQuery, params, tags: ["products"] }),
  ]);

  return {
    totalItems: totalItems as number,
    products: products as ProductSummary[],
  };
}

export async function fetchAllCategoriesService() {
  const query = groq`*[_type == "category"] | order(name asc) { _id, name }`;
  const { data: categories } = await sanityFetch({
    query,
    params: {},
    tags: ["categories"],
  });
  return categories as Array<{ _id: string; name: string }>;
}

export async function toggleProductAvailabilityService(
  productId: string,
  available: boolean
) {
  await writeClient.patch(productId).set({ available }).commit();
  return { success: true };
}

export async function uploadProductImageService(buffer: Buffer, file: File) {
  const asset = await writeClient.assets.upload("image", buffer, {
    filename: file.name,
    contentType: file.type,
  });
  return asset._id;
}

type DocumentFieldsValue =
  | string
  | number
  | boolean
  | "mild"
  | "medium"
  | "hot"
  | "extra-Hot"
  | null
  | undefined
  | string[]
  | { _type: string; _ref: string }
  | { _type: string; _key: string; asset: { _type: string; _ref: string } }[]
  | { _key: string; size: { _type: string; _ref: string } }[]
  | { _type: string; _ref: string; _key: string }[];

export async function saveProductService(data: {
  productId?: string;
  name: string;
  price: number;
  order: number;
  categoryRefId: string;
  description: string;
  preparationTime?: number | null;
  spiceLevel?: "mild" | "medium" | "hot" | "extra-Hot" | "none" | null;
  enableAllSizes: boolean;
  featured: boolean;
  imageAssetIds: string[];
  sizeIds: string[];
  varietyIds: string[];
  ingredientIds: string[];
}) {
  const {
    productId,
    name,
    price,
    order,
    categoryRefId,
    description,
    preparationTime,
    spiceLevel,
    enableAllSizes,
    featured,
    imageAssetIds,
    sizeIds,
    varietyIds,
    ingredientIds,
  } = data;

  const orderConflict = await client.fetch(
    groq`*[_type == "food" && order == $order && !(_id in [$id, "drafts." + $id])][0]`,
    { order, id: productId || "" }
  );
  if (orderConflict) {
    throw new ServiceError(
      `Display Order ${order} is already assigned to "${orderConflict.name}"`
    );
  }

  let updatedImages: DocumentFieldsValue | undefined = undefined;

  if (imageAssetIds) {
    updatedImages = imageAssetIds.map((assetId, idx) => ({
      _type: "image",
      _key: `img_${assetId}_${idx}`,
      asset: {
        _type: "reference",
        _ref: assetId,
      },
    }));
  }

  const sizeObjects = sizeIds.map((sid) => ({
    _key: `sz_${sid}`,
    size: { _type: "reference", _ref: sid },
  }));

  const varietyRefs = varietyIds.map((vid) => ({
    _type: "reference",
    _ref: vid,
    _key: `var_${vid}`,
  }));

  const ingredientRefs = ingredientIds.map((iid) => ({
    _type: "reference",
    _ref: iid,
    _key: `ing_${iid}`,
  }));

  const documentFields: Record<string, DocumentFieldsValue> = {
    name,
    price,
    order,
    category: { _type: "reference", _ref: categoryRefId },
    description,
    preparationTime: preparationTime || null,
    spiceLevel: spiceLevel === "none" ? null : spiceLevel,
    enableAllSizes,
    featured,
    sizes: sizeObjects,
    varieties: varietyRefs,
    ingredients: ingredientRefs,
  };

  if (updatedImages) {
    documentFields.images = updatedImages;
  }

  if (productId) {
    await writeClient.patch(productId).set(documentFields).commit();
  } else {
    const slugValue = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

    await writeClient.create({
      _type: "food",
      available: true,
      slug: {
        _type: "slug",
        current: slugValue,
      },
      ...documentFields,
    });
  }

  return { success: true };
}

export async function createCategoryService(name: string, description?: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-");

  await writeClient.create({
    _type: "category",
    name,
    description: description || "",
    slug: {
      _type: "slug",
      current: slug,
    },
  });
}

export async function createSizeService(data: {
  name: string;
  code: string;
  description?: string;
  serveSize: number;
  order: number;
}) {
  const { name, code, description, serveSize, order } = data;
  const orderConflict = await client.fetch(
    groq`*[_type == "size" && order == $order][0]`,
    { order }
  );
  if (orderConflict) {
    throw new ServiceError(
      `Display order ${order} is already assigned to "${orderConflict.name}"`
    );
  }
  await writeClient.create({
    _type: "size",
    name,
    code,
    description: description || "",
    serveSize,
    order,
  });
}

export async function createVarietyService(data: {
  name: string;
  description?: string;
  order: number;
}) {
  const { name, description, order } = data;
  const orderConflict = await client.fetch(
    groq`*[_type == "foodVariety" && order == $order][0]`,
    { order }
  );
  if (orderConflict) {
    throw new ServiceError(
      `Display order ${order} is already assigned to "${orderConflict.name}"`
    );
  }
  await writeClient.create({
    _type: "foodVariety",
    name,
    description: description || "",
    order,
  });
}

export async function createIngredientService(data: {
  name: string;
  description?: string;
  order: number;
}) {
  const { name, description, order } = data;
  const orderConflict = await client.fetch(
    groq`*[_type == "ingredient" && order == $order][0]`,
    { order }
  );
  if (orderConflict) {
    throw new ServiceError(
      `Display order ${order} is already assigned to "${orderConflict.name}"`
    );
  }
  await writeClient.create({
    _type: "ingredient",
    name,
    description: description || "",
    order,
  });
}

export async function deleteProductService(productId: string) {
  await writeClient.delete(productId);
}
