import { urlFor } from "@/sanity/lib/image";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "../../types/sanityTypes";

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
  return `${day}d ago`;
}

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getUserImage = (user: User) => {
  if (!user.image) return null;

  if (user.image.source === "url") {
    return user.image.url;
  }

  if (user.image.source === "asset") {
    return urlFor(user.image.asset!).url();
  }

  return null;
};
