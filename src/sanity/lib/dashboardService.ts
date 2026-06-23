import { DashboardData } from "../types/dashboard";
import { client } from "./client";

const DASHBOARD_QUERY = `{
  "foodItemsCount": count(*[_type == "food"]),
  "ordersCount": count(*[_type == "order"]),
  "customersCount": count(*[_type == "user"]),
  "reviewsCount": count(*[_type == "review"]),
  "categoriesCount": count(*[_type == "category"]),
  "bannersCount": count(*[_type == "banner"]),
  "categoryDistribution": *[_type == "category"] {
    name,
    "value": count(*[_type == "food" && references(^._id)])
  },
  "recentActivity": *[_type in ["order", "user", "review"]] | order(_createdAt desc)[0..9] {
    _type,
    _id,
    _createdAt,
    "title": coalesce( user->name, orderNumber, title, "Untitled"),
    "subtitle": coalesce(_type, userEmail, email )
  },
  "reviewStats": {
    "average": coalesce(round(math::sum(*[_type == "review"].rating) / count(*[_type == "review"]), 2), 0),
    "total": count(*[_type == "review"]),
    "distribution": [
      { "rating": 5, "count": count(*[_type == "review" && rating == 5]) },
      { "rating": 4, "count": count(*[_type == "review" && rating == 4]) },
      { "rating": 3, "count": count(*[_type == "review" && rating == 3]) },
      { "rating": 2, "count": count(*[_type == "review" && rating == 2]) },
      { "rating": 1, "count": count(*[_type == "review" && rating == 1]) }
    ]
  },
  "topFoods": *[_type == "food"] {
    name,
    "orderCount": count(*[_type == "order" && references(^._id)])
  } | order(orderCount desc)[0..4],
  "orderTrends": *[_type == "order" && _createdAt > $sinceDate] | order(_createdAt asc) {
    _createdAt,
    total
  }
}`;

export async function fetchDashboardData(): Promise<DashboardData> {
  const sinceDate = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const response = await client.fetch(DASHBOARD_QUERY, { sinceDate });
  return response as DashboardData;
}
