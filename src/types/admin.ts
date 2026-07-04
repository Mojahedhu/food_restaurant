import { Order, User, Food, UserImage } from "../../sanity.types";
import { Address, SanityImage } from "../../types/sanityTypes";

// We extract only the exact fields present in your Order type
export type OrderSummary = Pick<
  Order,
  | "_id"
  | "_createdAt"
  | "orderNumber"
  | "status"
  | "total"
  | "paymentStatus"
  | "user"
  | "userName"
  | "userEmail"
  | "items"
  | "deliveryAddress"
  | "subtotal"
  | "deliveryFee"
  | "tax"
  | "paymentMethod"
>;

// Exact fields for Food
export type ProductSummary = Omit<
  Pick<
    Food,
    | "_id"
    | "name"
    | "price"
    | "order"
    | "category"
    | "available"
    | "images"
    | "description"
    | "preparationTime"
    | "spiceLevel"
    | "enableAllSizes"
    | "featured"
  > & {
    sizes: Array<{ _id: string; name: string }>;
    varieties: Array<{ _id: string; name: string }>;
    ingredients: Array<{ _id: string; name: string }>;
  },
  "category"
> & {
  category: { _id: string; name?: string } | null;
};
// Exact fields for User
export type UserSummary = Pick<
  User,
  | "_id"
  | "_createdAt"
  | "name"
  | "email"
  | "role"
  | "phoneNumber"
  | "bio"
  | "walletBalance"
  | "image"
  | "provider"
>;

export type AddressSummary = Pick<
  Address,
  | "_id"
  | "type"
  | "label"
  | "street"
  | "apartment"
  | "city"
  | "state"
  | "zipCode"
  | "phone"
  | "instructions"
  | "isDefault"
>;

export type WalletTransaction = {
  _id: string;
  _createdAt: string;
  amount: number;
  balanceAfter: number;
  type: "deposit" | "purchase";
  mode: string;
  order?: { _id: string; orderNumber: string };
};

/* * ======================================================================
 * definition for the admin Dashboard
 * ======================================================================
 */

export interface DashboardStats {
  totalRevenue: number;
  ordersCount: number;
  usersCount: number;
  aov: number;
}

export interface RecentActivity {
  recentOrders: Array<{
    _id: string;
    _createdAt: string;
    orderNumber: string;
    userName: string;
    total: number;
    paymentStatus: string;
    status: {
      title: string;
      color: string;
    } | null;
  }>;
  newUsers: Array<{
    _id: string;
    _createdAt: string;
    name: string;
    email: string;
    image: UserImage | undefined;
    role: {
      name: string;
    };
  }>;
  recentReviews: Array<{
    _id: string;
    _createdAt: string;
    rating: number;
    comment: string;
    foodName: string;
    user: {
      name: string;
      image: UserImage;
    } | null;
  }>;
}

export interface RevenueChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface StatusDistributionPoint {
  name: string;
  value: number;
  color: string;
  fill: string;
}

/* * ======================================================================
 * definition for the admin Review
 * ======================================================================
 */

export interface ReviewSummary {
  _id: string;
  _createdAt: string;
  rating: number;
  comment: string;
  approved: boolean;
  adminReply?: string;
  food: {
    _id: string;
    name: string;
    images?: SanityImage;
  } | null;
  user: {
    _id: string;
    name: string;
    email: string;
    image?: UserImage;
  } | null;
}

export interface RatingDistributionPoint {
  stars: number;
  count: number;
  percentage: number;
}

export interface ReviewMetricsSummary {
  totalReviews: number;
  pendingReviews: number;
  averageRating: number;
  distribution: RatingDistributionPoint[];
}

export interface ReviewMetrics extends ReviewMetricsSummary {
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

export interface ReviewTotal {
  reviews: ReviewSummary[];
  total: number;
}

/* * ======================================================================
 * definition for the admin Settings
 * ======================================================================
 */

export interface ScheduleSummary {
  _id: string;
  name: string;
}

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
    _type?: "object";
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
