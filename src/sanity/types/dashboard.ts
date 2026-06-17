export interface CategoryDistributionItem {
  name: string;
  value: number;
}

export interface RecentActivityItem {
  _type: "order" | "user" | "review";
  _id: string;
  _createdAt: string;
  title: string;
  subtitle: string;
}

export interface ReviewDistributionItem {
  rating: number;
  count: number;
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: ReviewDistributionItem[];
}

export interface TopFoodItem {
  name: string;
  orderCount: number;
}

export interface OrderTrendItem {
  _createdAt: string;
  total: number;
}

export interface DashboardData {
  foodItemsCount: number;
  ordersCount: number;
  customersCount: number;
  reviewsCount: number;
  categoriesCount: number;
  bannersCount: number;
  categoryDistribution: CategoryDistributionItem[];
  recentActivity: RecentActivityItem[];
  reviewStats: ReviewStats;
  topFoods: TopFoodItem[];
  orderTrends: OrderTrendItem[];
}
