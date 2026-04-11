/**
 * Extended types for GROQ query results
 * These types extend the base Sanity types with resolv
 */
import type {
  Food as BaseFood,
  Category as BaseCategory,
  FoodVariety as BaseFoodVariety,
  Size as BaseSize,
  Ingredient as BaseIngredient,
} from "../sanity.types";

/**
 * Food with resolved category reference
 */
export interface FoodWithCategory extends Omit<
  BaseFood,
  "category" | "slug" | "averageRating" | "totalReviews"
> {
  slug?: string;
  category?: {
    _id: string;
    name?: string;
    slug?: string;
  } | null;
  basePrice?: number | null;
  averageRating?: number | null;
  totalReviews?: number | null;
}

/**
 * Food with resolved category and varieties
 */
export interface FoodWithDetails extends Omit<
  BaseFood,
  "category" | "varieties" | "slug" | "averageRating" | "totalReviews"
> {
  slug?: string;
  category?: {
    _id: string;
    name?: string;
    slug?: string;
  } | null;
  varieties?: Array<{
    _id: string;
    name?: string;
  }> | null;
  averageRating?: number | null;
  totalReviews?: number | null;
  basePrice?: number | null;
  size?: string | null;
  variety?: string | null;
}

/**
 * Complete food item with all resolved references
 */
export interface FoodComplete extends Omit<
  BaseFood,
  | "category"
  | "varieties"
  | "sizes"
  | "ingredients"
  | "slug"
  | "averageRating"
  | "totalReviews"
> {
  slug?: string;
  category?: {
    _id: string;
    name?: string;
    slug?: string;
    description?: string;
    image?: BaseCategory["image"];
    order?: number;
    isActive?: boolean;
  } | null;
  variants?: Array<{
    _id: string;
    name?: string;
    description?: string;
    order?: number;
  }> | null;

  sizes?: Array<{
    size?: {
      _id: string;
      name?: string;
      code?: string;
      description?: string;
      serveSize?: number;
      order?: number;
    };
  }> | null;
  ingredients?: Array<{
    _id: string;
    name?: string;
    description?: string;
    order?: number;
  }> | null;

  averageRating?: number | null;
  totalReviews?: number | null;
}

/**
 * Category with resolved slug
 */
export interface CategoryWithSlug extends Omit<BaseCategory, "slug"> {
  slug?: string;
}

/**
 * Size with complete details
 */
export type SizeComplete = BaseSize;

/**
 * Food variety with complete details
 */
export type FoodVarietyComplete = BaseFoodVariety;

/**
 * Ingredient with complete details
 */
export type IngredientComplete = BaseIngredient;

/**
 * Restaurant type with complete details
 */
export interface restaurant {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: any;
  location: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  email: string;
  openingHours?: {
    _id: string;
    name: string;
    schedule: Array<{
      day: string;
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }>;
  };
  allFoodItemsAvailable?: boolean;
  foodItems?: Array<FoodWithDetails>;
  categories?: Array<{
    _id: string;
    title?: string;
    slug?: string;
    image?: any;
  }>;
  rating?: number;
  totalReviews?: number;
  isActive: boolean;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: number;
  categoriesCount?: number;
  foodItemsCount?: number;
}
