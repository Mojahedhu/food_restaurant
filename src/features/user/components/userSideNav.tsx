import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LayoutDashboard, MapPin, ShoppingBag, User } from "lucide-react";
import Link from "next/link";

interface UserSideNavProps {
  openSideMenu: boolean;
  setOpenSideMenu: (openSideMenu: boolean) => void;
  pathSegments: string;
}

const UserSideNav = ({
  openSideMenu,
  setOpenSideMenu,
  pathSegments,
}: UserSideNavProps) => {
  return (
    <Sheet open={openSideMenu} onOpenChange={setOpenSideMenu}>
      <SheetContent className="w-80! p-6" side="left">
        <SheetHeader className="p-0 space-y-2 text-center sm:text-left border-b pb-4">
          <SheetTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            Dashboard Menu
          </SheetTitle>

          <SheetDescription className="sr-only">
            Navigate between your dashboard sections
          </SheetDescription>
        </SheetHeader>

        <nav className="mt-6 space-y-1">
          <Link
            onClick={() => setOpenSideMenu(false)}
            href="/user/dashboard"
            className={cn(
              "flex items-start gap-3 py-3.5 px-4 rounded-lg text-sm font-medium hover:bg-primary/5  transition-all duration-200",
              pathSegments === "dashboard"
                ? "bg-primary/10 text-primary border-l-4 border-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div
              className={cn(
                "p-2 rounded-lg transition-colors",
                pathSegments === "dashboard" ? "bg-primary/20" : "bg-muted",
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span>Dashboard</span>
              <span className="text-[12px] text-muted-foreground">
                Overview &amp; stats
              </span>
            </div>
          </Link>
          <Link
            onClick={() => setOpenSideMenu(false)}
            href="/user/orders"
            className={cn(
              "flex items-start gap-3 py-3.5 px-4 rounded-lg text-sm font-medium hover:bg-primary/5  transition-all duration-200",
              pathSegments === "orders"
                ? "bg-primary/10 text-primary border-l-4 border-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div
              className={cn(
                "p-2 rounded-lg transition-colors",
                pathSegments === "orders" ? "bg-primary/20" : "bg-muted",
              )}
            >
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span>Orders</span>
              <span className="text-[12px] text-muted-foreground">
                Order &amp; history
              </span>
            </div>
          </Link>
          <Link
            onClick={() => setOpenSideMenu(false)}
            href="/user/addresses"
            className={cn(
              "flex items-start gap-3 py-3.5 px-4 rounded-lg text-sm font-medium hover:bg-primary/5  transition-all duration-200",
              pathSegments === "addresses"
                ? "bg-primary/10 text-primary border-l-4 border-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div
              className={cn(
                "p-2 rounded-lg transition-colors",
                pathSegments === "addresses" ? "bg-primary/20" : "bg-muted",
              )}
            >
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span>Addresses</span>
              <span className="text-[12px] text-muted-foreground">
                Delivery addresses
              </span>
            </div>
          </Link>
          <Link
            onClick={() => setOpenSideMenu(false)}
            href="/user/profile"
            className={cn(
              "flex items-start gap-3 py-3.5 px-4 rounded-lg text-sm font-medium hover:bg-primary/5  transition-all duration-200",
              pathSegments === "profile"
                ? "bg-primary/10 text-primary border-l-4 border-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div
              className={cn(
                "p-2 rounded-lg transition-colors",
                pathSegments === "profile" ? "bg-primary/20" : "bg-muted",
              )}
            >
              <User className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span>Profile</span>
              <span className="text-[12px] text-muted-foreground">
                Account settings
              </span>
            </div>
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default UserSideNav;
