/**
 * Extended types for GROQ query results
 * These types extend the base Sanity types with resolve
 */
import { SanityAsset } from "@sanity/image-url/lib/types/types";
import type {
  Food as BaseFood,
  Category as BaseCategory,
  FoodVariety as BaseFoodVariety,
  Size as BaseSize,
  Ingredient as BaseIngredient,
  Slug,
  internalGroqTypeReferenceTo,
  UserImage,
  ReactionType,
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
  price?: number | undefined;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    image?: SanityAsset;
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

// Address type
export interface Address {
  _id: string;
  type?: string;
  label?: string;
  street?: string;
  apartment?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  instructions?: string;
  isDefault?: boolean;
}

//======================================================

// Order and Order Status interface

// ==================================================

export type Order = {
  _id: string;
  _type: "order";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  orderNumber?: string;
  user?: {
    _ref: string;
    _type: "reference";
    _weak?: boolean;
    [internalGroqTypeReferenceTo]?: "user";
  };
  userEmail?: string;
  userName?: string;
  items?: Array<{
    foodId?: string;
    name?: string;
    image?: string;
    price?: number;
    quantity?: number;
    size?: string;
    variety?: string;
    _key: string;
  }>;
  deliveryAddress?: {
    type?: string;
    label?: string;
    street?: string;
    apartment?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
    instructions?: string;
  };
  subtotal?: number;
  deliveryFee?: number;
  tax?: number;
  total?: number;
  originalTotal?: number;
  paymentMethod?: "online" | "cod";
  paymentStatus?: "pending" | "paid" | "failed";
  status?: {
    _ref: string;
    _type: "reference";
    _weak?: boolean;
    [internalGroqTypeReferenceTo]?: "orderStatus";
  };
  estimatedDeliveryTime?: string;
  notes?: string;
  StripeSessionId?: string;
  stripePaymentIntent?: string;
  isViewed?: boolean;
};

export type OrderStatus = {
  _id: string;
  _type: "orderStatus";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  title?: string;
  value?: Slug;
  description?: string;
  color?: string;
  order?: number;
  isDefault?: boolean;
  isActive?: boolean;
};

// =========================================
// User type
// =========================================

export type User = {
  _id: string;
  _type: "user";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  name?: string;
  email?: string;
  password?: string;
  image?: UserImage;
  emailVerified?: string;
  phoneNumber?: string;
  bio?: string;
  provider?: "credentials" | "google";
  role?: {
    _ref: string;
    _type: "reference";
    _weak?: boolean;
    [internalGroqTypeReferenceTo]?: "userRole";
  };
  createdAt?: string;

  walletBalance?: number;
};

/**
 * Review and ReviewReaction type
 */

export type Review = {
  _id: string;
  _type: "review";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  food?: {
    _ref: string;
    _type: "reference";
  };
  user?: {
    name: string;
    image?: UserImage;
  };
  rating?: number;
  approved?: boolean;
  comment?: string;
  // denormalized counters
  likesCount: number;
  dislikesCount: number;
  createdAt?: string;
};

export interface ReviewReaction {
  _id: string;
  _type: "reviewReaction";
  _createdAt?: string;
  _updatedAt?: string;
  _rev?: string;

  review: {
    _type: "reference";
    _ref: string;
  };

  user: {
    _type: "reference";
    _ref: string;
  };

  type: ReactionType;

  createdAt: string;
}

// ReviewsWithReactionsByFoodIdQueryResult

export interface ReviewsWithReactionsByFoodIdQueryResult {
  _id: string;

  rating: number;
  comment: string;

  likesCount: number;
  dislikesCount: number;
  food: {
    _id: string;
    name: string;
    slug: string;
  };

  user: {
    name: string;
    image?: string;
  };

  myReaction: ReactionType | null;
}
