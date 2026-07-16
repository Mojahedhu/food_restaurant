import { groq } from "next-sanity";
import { format, subDays, parseISO, getHours } from "date-fns";
import { sanityFetch } from "@/sanity/lib/live";

export interface AnalyticsKPIs {
  totalRevenue: number;
  totalOrders: number;
  aov: number;
  completionRate: number;
}

export interface SalesPoint {
  date: string;
  revenue: number;
  orders: number;
  aov: number;
}

export interface ProductSale {
  name: string;
  sales: number;
  revenue: number;
}

export interface CategoryShare {
  name: string;
  value: number;
  color: string;
}

export interface HourlyLoad {
  hour: string;
  count: number;
}

export interface PaymentMethodPoint {
  method: string;
  count: number;
  value: number;
}

export interface AnalyticsData {
  kpis: AnalyticsKPIs;
  salesOverTime: SalesPoint[];
  topProducts: ProductSale[];
  categoryShare: CategoryShare[];
  hourlyDistribution: HourlyLoad[];
  paymentMethods: PaymentMethodPoint[];
}

interface ReturnedOrder {
  _id: string;
  _createdAt: string;
  total: number;
  paymentStatus: string;
  paymentMethod: string;
  status: { title: string; slug: { _id: string; current: string } };
  items: {
    foodId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}

interface ReturnedFood {
  _id: string;
  categoryName: string;
}

export async function fetchAdminAnalyticsDataService(): Promise<AnalyticsData> {
  const ordersQuery = groq`*[_type == "order"] {
    _id,
    _createdAt,
    total,
    paymentStatus,
    paymentMethod,
    status->{ title, slug },
    items[] {
      foodId,
      name,
      price,
      quantity
    }
  }`;

  const foodsQuery = groq`*[_type == "food"] {
    _id,
    "categoryName": category->name
  }`;

  const [orderData, foodsData] = await Promise.all([
    sanityFetch({ query: ordersQuery }),
    sanityFetch({ query: foodsQuery }),
  ]);

  const orders = orderData.data as ReturnedOrder[];
  const foods = foodsData.data as ReturnedFood[];

  const foodCategoryMap = new Map<string, string>();
  foods.forEach((food) => {
    if (food._id && food.categoryName) {
      foodCategoryMap.set(food._id, food.categoryName);
    }
  });

  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const totalOrdersCount = orders.length;
  const paidOrdersCount = paidOrders.length;

  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const aov =
    paidOrdersCount > 0
      ? Math.round((totalRevenue / paidOrdersCount) * 100) / 100
      : 0;

  const deliveredCount = orders.filter(
    (o) =>
      o.status?.slug?.current === "delivered" ||
      o.status?.title?.toLowerCase().includes("delivered"),
  ).length;
  const completionRate =
    totalOrdersCount > 0
      ? Math.round((deliveredCount / totalOrdersCount) * 100)
      : 0;

  const salesMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 29; i >= 0; i--) {
    const dateStr = format(subDays(new Date(), i), "yyyy-MM-dd");
    salesMap.set(dateStr, { revenue: 0, orders: 0 });
  }

  paidOrders.forEach((order) => {
    const dateStr = format(parseISO(order._createdAt), "yyyy-MM-dd");
    if (salesMap.has(dateStr)) {
      const current = salesMap.get(dateStr)!;
      salesMap.set(dateStr, {
        revenue: current.revenue + (order.total || 0),
        orders: current.orders + 1,
      });
    }
  });

  const salesOverTime: SalesPoint[] = [];
  salesMap.forEach((val, date) => {
    const displayDate = format(parseISO(date), "MMM dd");
    const dayAov =
      val.orders > 0 ? Math.round((val.revenue / val.orders) * 100) / 100 : 0;
    salesOverTime.push({
      date: displayDate,
      revenue: Math.round(val.revenue * 100) / 100,
      orders: val.orders,
      aov: dayAov,
    });
  });

  const productMap = new Map<string, { sales: number; revenue: number }>();
  paidOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const name = item.name || "Unknown Product";
      const qty = item.quantity || 0;
      const rev = (item.price || 0) * qty;

      const current = productMap.get(name) || { sales: 0, revenue: 0 };
      productMap.set(name, {
        sales: current.sales + qty,
        revenue: current.revenue + rev,
      });
    });
  });

  const topProducts: ProductSale[] = Array.from(productMap.entries())
    .map(([name, data]) => ({
      name,
      sales: data.sales,
      revenue: Math.round(data.revenue * 100) / 100,
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  const categoryMap = new Map<string, number>();
  paidOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const catName = foodCategoryMap.get(item.foodId) || "Other";
      const rev = (item.price || 0) * (item.quantity || 0);
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + rev);
    });
  });

  const colors = [
    "#ea580c",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#6b7280",
  ];
  const categoryShare: CategoryShare[] = Array.from(categoryMap.entries())
    .map(([name, value], idx) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: colors[idx % colors.length],
    }))
    .sort((a, b) => b.value - a.value);

  const hourlyMap = new Map<number, number>();
  for (let h = 0; h < 24; h++) {
    hourlyMap.set(h, 0);
  }
  orders.forEach((order) => {
    const hour = getHours(parseISO(order._createdAt));
    hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
  });

  const hourlyDistribution: HourlyLoad[] = Array.from(
    hourlyMap.entries(),
  ).map(([hour, count]) => {
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return {
      hour: `${displayHour} ${ampm}`,
      count,
    };
  });

  const paymentMap = new Map<string, { count: number; value: number }>();
  paidOrders.forEach((order) => {
    const rawMethod = order.paymentMethod || "unknown";
    const displayMethod =
      rawMethod === "online"
        ? "Stripe Credit Card"
        : rawMethod === "cod"
          ? "Cash On Delivery"
          : "Wallet Balance";
    const current = paymentMap.get(displayMethod) || { count: 0, value: 0 };
    paymentMap.set(displayMethod, {
      count: current.count + 1,
      value: current.value + (order.total || 0),
    });
  });

  const paymentMethods: PaymentMethodPoint[] = Array.from(
    paymentMap.entries(),
  ).map(([method, data]) => ({
    method,
    count: data.count,
    value: Math.round(data.value * 100) / 100,
  }));

  return {
    kpis: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: totalOrdersCount,
      aov,
      completionRate,
    },
    salesOverTime,
    topProducts,
    categoryShare,
    hourlyDistribution,
    paymentMethods,
  };
}
