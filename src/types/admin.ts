import { Order, User, Food } from "../../sanity.types";

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
>;

// Exact fields for Food
export type ProductSummary = Pick<
  Food,
  "_id" | "name" | "price" | "category" | "available" | "images"
>;

// Exact fields for User
export type UserSummary = Pick<
  User,
  "_id" | "_createdAt" | "name" | "email" | "role"
>;
