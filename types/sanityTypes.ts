/**
 * Extended types for GROQ query results
 * These types extend the base Sanity types with resolve
 */

import {
  SanityAsset,
  SanityImageCrop,
  SanityImageHotspot,
} from "@sanity/image-url";
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
  Post,
} from "../sanity.types";
import { PortableTextBlock, SanityImageAssetDocument } from "next-sanity";

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
  | "category"
  | "varieties"
  | "slug"
  | "averageRating"
  | "totalReviews"
  | "sizes"
  | "ingredients"
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
  sizes?: {
    _key: string;
    size: {
      _id: string;
      name?: string;
    };
  }[];
  ingredients?: {
    _id: string;
    name?: string;
  }[];
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
export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: SanityAsset;
  location: {
    address: string;
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
    name?: string;
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

/* =======================================================
 *  Post details type
 * =======================================================
 */
export interface SanityImage {
  _type: "image";
  asset?: SanityImageAssetDocument;
  hotspot?: SanityImageHotspot;
  crop?: SanityImageCrop;
}

export interface PostAuthor {
  _id: string;
  name: string;
  image?: SanityImage;
  bio: string;
}

export interface PostCategory {
  _id: string;
  title: string;
  slug: string;
}

export interface PostMainImage extends SanityImage {
  alt?: string;
}

export interface PortableTextImageBlock extends SanityImage {
  _key: string;
}

export interface TwoUpImagesBlock {
  _type: "twoUpImages";
  _key: string;

  caption?: string;

  image1?: SanityImage;
  image2?: SanityImage;
}

export type PostBodyBlock =
  | PortableTextBlock
  | PortableTextImageBlock
  | TwoUpImagesBlock;

export type PostCard = Pick<
  Post,
  "title" | "mainImage" | "publishedAt" | "_id"
> & {
  categories?: PostCategory[];
  author?: PostAuthor;
  slug?: {
    current?: string;
  };
};
/**
 * Review and ReviewReaction type
 */

export type SanityReference = {
  _ref: string;
  _type: string;
};

export interface PostDetails {
  _id: string;
  _type: "post";

  _createdAt: string;
  _updatedAt: string;

  title: string;
  slug: string;

  isFeatured?: boolean;
  publishedAt?: string;

  author?: PostAuthor;

  mainImage?: PostMainImage;

  categories?: PostCategory[];

  body?: PostBodyBlock[];
}

export interface LatestPost {
  _id: string;
  title: string;
  slug: string;
  mainImage?: SanityImage;
  publishedAt: string;
}

/**
 * =========================================================
 * Review static part
 * =========================================================
 */

export interface ReviewStatic {
  _type: "review";
  _rev: string;
  _updatedAt: string;

  food: SanityReference;
  foodName: string;

  _id: string;

  user: {
    _id: string;
    name: string;
    image: UserImage;
  };

  rating: number;
  comment: string;
  approved: boolean;
  adminReply?: string;

  _createdAt: string;
}

/**
 * =========================================================
 * Review metric part
 * =========================================================
 */

export interface ReviewMetricsProjection {
  reviewId: string;

  likesCount: number;
  dislikesCount: number;
}

export type ReviewMetrics = ReviewMetricsProjection;

/**
 * =========================================================
 * Review reaction projection
 * =========================================================
 */

export interface ReviewReactionProjection {
  reviewId: string;
  confirmedReaction: ReactionType | null;
}

/**
 * =========================================================
 * Raw review document from Sanity
 * =========================================================
 */

export type SanityReview = {
  _type: "review";
  _rev: string;
  _updatedAt: string;

  _id: string;

  user: {
    _id: string;
    name: string;
    image: UserImage;
  };

  rating?: number;
  comment?: string;
  approved?: boolean;
  adminReply?: string;

  _createdAt: string;

  food: SanityReference;
  foodName: string;
};

/**
 * =========================================================
 * Raw reaction document from Sanity
 * =========================================================
 */

export interface SanityReviewReaction {
  _id: string;
  _type: "reviewReaction";

  type: ReactionType | null;

  mutationId: string;

  review: SanityReference;
  food: SanityReference;
  user: SanityReference;

  _createdAt?: string;
  _updatedAt?: string;
}

/**
 * =========================================================
 * Optimistic mutation lifecycle
 * =========================================================
 */

export interface PendingReactionMutation {
  mutationId: string;

  optimisticReaction: ReactionType | null;

  startedAt: number;

  reactionConfirmed: boolean;
}

/**
 * =========================================================
 * Frontend projection model
 * =========================================================
 */

export interface ReviewView {
  review: SanityReview;

  metrics: ReviewMetrics;

  /**
   * Last confirmed server reaction
   */
  confirmedReaction: ReactionType | null;

  /**
   * Active optimistic mutation
   */
  pendingMutations: PendingReactionMutation[];

  /**
   * Last synchronized
   */
}

/**
 * =========================================================
 * Pending operations (mutations in flight)
 * =========================================================
 */

export interface PendingReviewOperation {
  operationId: string;

  type: "create" | "update" | "delete";

  snapshot?: ReviewView;

  startedAt: number;
}

/**
 * =========================================================
 * Normalized reducer state
 * =========================================================
 */

export interface ReviewState {
  reviews: Record<string, ReviewView>;

  /**
   * Operations in flight (create/update/delete)
   */
  pendingReviewOperations: Record<string, PendingReviewOperation>;
}

/**
 * =========================================================
 * UI selector result
 * =========================================================
 */

export interface ReviewDisplayState {
  review: SanityReview;

  likesCount: number;
  dislikesCount: number;

  activeReaction: ReactionType | null;

  isLiked: boolean;
  isDisliked: boolean;

  pending: boolean;
}

/**
 * =========================================================
 * Category Type
 * =========================================================
 */

/**
 * Category with resolved slug
 */
export interface CategoryWithCount extends Omit<BaseCategory, "slug"> {
  slug?: string;
  itemsCount?: number;
  itemCount?: number; // projected in CATEGORIES_QUERY
  foodItems?: FoodWithDetails[];
}
