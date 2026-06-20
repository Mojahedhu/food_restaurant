"use client";

import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Star,
  BarChart3,
  Settings,
} from "lucide-react";

export const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/reviews", icon: Star, label: "Product Reviews" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void; // Used to close the mobile menu on click
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex-col w-64 border-r bg-card h-full transition-all duration-300",
        className,
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b shrink-0">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="size-8 bg-primary rounded-md flex items-center justify-center shrink-0">
            <span className="text-primary-foreground text-xl">🥗</span>
          </div>
          <span>Admin Dashboard</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md animate-in slide-in-from-left-full" />
              )}

              <item.icon
                className={cn(
                  "size-5 transition-transform duration-200 shrink-0",
                  isActive ? "text-primary scale-110" : "group-hover:scale-110",
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
