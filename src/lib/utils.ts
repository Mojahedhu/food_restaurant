import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "../../types/sanityTypes";
import { urlFor } from "@/sanity/lib/image";
import { SanityAsset } from "@sanity/image-url";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getElapsedTime(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();

  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);

  if (sec < 60) return `${sec}s ago`;
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;

  const day = Math.floor(hr / 24);
  if (day < 7) return day === 1 ? `${day} day ago` : `${day} days ago`;

  const week = Math.floor(day / 7);
  if (week < 4) return week === 1 ? `${week} week ago` : `${week} weeks ago`;

  const month = Math.floor(day / 30);
  if (month < 12)
    return month === 1 ? `${month} month ago` : `${month} months ago`;

  const year = Math.floor(month / 12);
  return year === 1 ? `${year} year ago` : `${year} years ago`;
}

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getUserImage = (user: Partial<User>) => {
  if (!user) return null;

  if (user?.image?.source === "url") {
    return user.image.url;
  }
  if (user?.image?.source === "asset") {
    return urlFor(user.image.asset!).url();
  }

  return null;
};

export const dateFormatter = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
export const dateFormatterDeep = (dateString: string) => {
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .split(",");
};

/* ======================================================
 * Format currency for display
 *
 * @param {number} amount - The amount to format
 * @returns {string} The formatted currency string
 *
 * usage:
 * formatCurrency(100)
 */

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

/*
 *  Image Helper Functions
 *  Usage: getImageUrl(imageSource)
 */
export const getImageUrl = (imageSource?: SanityAsset | string) => {
  if (!imageSource) return "";
  if (typeof imageSource === "string") {
    if (imageSource.startsWith("http") || imageSource.startsWith("/")) {
      return imageSource;
    }
    return imageSource;
  }
  try {
    return urlFor(imageSource).url();
  } catch (e) {
    return `${e}`;
  }
};

/*
 * Helper function to forma payment method
 */

export const formatPaymentMethod = (method: string) => {
  switch (method) {
    case "online":
      return "Online Payment (Stripe)";
    case "cash":
      return "Cash on Delivery";
    default:
      return method;
  }
};

/*  Helper to colorize payment status
 *  Usage: getPaymentStatusColor(status)
 */
export const getPaymentStatusColor = (status?: string) => {
  switch (status) {
    case "paid":
      return "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-accent";
    case "failed":
      return "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20";
    case "pending":
    default:
      return "bg-amber-100/80 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50";
  }
};
