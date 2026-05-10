"use client";
import { cn } from "@/lib/utils";
import { LayoutDashboard, MapPin, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const UserNav = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  const currentPath = pathSegments[pathSegments.length - 1];
  return (
    <nav className="hidden lg:block">
      <div className="flex items-center gap-1 py-2">
        <Link
          className={cn(
            "relative flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ",
            currentPath === "dashboard"
              ? "bg-primary/10 text-primary hover:bg-primary/5 shadow-sm"
              : "hover:bg-primary/5 text-muted-foreground hover:text-foreground",
          )}
          href="/user/dashboard"
        >
          <LayoutDashboard className="h-4 w-4 transition transform" />
          <div className="flex flex-col">
            <span>Dashboard</span>
            <span className="text-[10px] text-muted-foreground">
              Overview &amp; stats
            </span>
          </div>
          {currentPath === "dashboard" && (
            <div
              className={
                "absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
              }
            ></div>
          )}
        </Link>
        <Link
          className={cn(
            "relative flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ",
            currentPath === "orders"
              ? "bg-primary/10 text-primary hover:bg-primary/5 shadow-sm"
              : "hover:bg-primary/5 text-muted-foreground hover:text-foreground",
          )}
          href="/user/orders"
        >
          <ShoppingBag className="h-4 w-4 transition transform" />
          <div className="flex flex-col">
            <span>Orders</span>
            <span className="text-[10px] text-muted-foreground">
              Order &amp; history
            </span>
          </div>
          {currentPath === "orders" && (
            <div
              className={
                "absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
              }
            ></div>
          )}
        </Link>
        <Link
          className={cn(
            "relative flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ",
            currentPath === "addresses"
              ? "bg-primary/10 text-primary hover:bg-primary/5 shadow-sm"
              : "hover:bg-primary/5 text-muted-foreground hover:text-foreground",
          )}
          href="/user/addresses"
        >
          <MapPin className="h-4 w-4 transition transform" />
          <div className="flex flex-col">
            <span>Addresses</span>
            <span className="text-[10px] text-muted-foreground">
              Delivery addresses
            </span>
          </div>
          {currentPath === "addresses" && (
            <div
              className={
                "absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
              }
            ></div>
          )}
        </Link>
        <Link
          className={cn(
            "relative flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ",
            currentPath === "profile"
              ? "bg-primary/10 text-primary hover:bg-primary/5 shadow-sm"
              : "hover:bg-primary/5 text-muted-foreground hover:text-foreground",
          )}
          href="/user/profile"
        >
          <User className="h-4 w-4 transition transform" />
          <div className="flex flex-col">
            <span>Profile</span>
            <span className="text-[10px] text-muted-foreground">
              Account &amp; settings
            </span>
          </div>
          {currentPath === "profile" && (
            <div
              className={
                "absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
              }
            ></div>
          )}
        </Link>
      </div>
    </nav>
  );
};

export default UserNav;
