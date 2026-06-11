import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "../../types/sanityTypes";
import { urlFor } from "@/sanity/lib/image";

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
  if (!user.image) return null;

  if (user.image.source === "url") {
    return user.image.url;
  }

  if (user.image.source === "asset") {
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
