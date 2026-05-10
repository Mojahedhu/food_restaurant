"use client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, MapPin, Menu, ShoppingBag, User } from "lucide-react";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import { useEffect, useState } from "react";
import UserSideNav from "./userSideNav";

const navConfig: Record<
  string,
  { label: string; Icon: React.ComponentType<{ className?: string }> | null }
> = {
  dashboard: {
    label: "Dashboard",
    Icon: ({ className }) => <LayoutDashboard className={className} />,
  },
  orders: {
    label: "Orders",
    Icon: ({ className }) => <ShoppingBag className={className} />,
  },
  addresses: {
    label: "Addresses",
    Icon: ({ className }) => <MapPin className={className} />,
  },
  profile: {
    label: "Profile",
    Icon: ({ className }) => <User className={className} />,
  },
  menu: {
    label: "Menu",
    Icon: null,
  },
};

const getNavData = (segment: string) => {
  if (navConfig[segment]) return navConfig[segment];

  // Fallback for valid but not listed routes
  return {
    label: segment.charAt(0).toUpperCase() + segment.slice(1),
    Icon: null,
  };
};

const UserNavButton = () => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const [activeSegment, setActiveSegment] = useState<string>("");

  const segments = usePathname().split("/").filter(Boolean);

  const segment = useSelectedLayoutSegment();

  const { label, Icon } = getNavData(activeSegment);

  useEffect(() => {
    // Case 1: navigation (segment temporarily null ) → do nothing
    if (!segment) return;

    // Case 2: nested route → show menu
    if (segments.length > 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSegment("menu");
      return;
    }
    // Case 3: Top level route
    if (segment) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSegment(segment!);
    }
  }, [segment, segments.length]);

  return (
    <div className="lg:hidden py-2">
      <Button
        variant={"outline"}
        size={"lg"}
        className="w-full justify-between gap-2 px-3 py-2 cursor-pointer"
        onClick={() => setOpenSideMenu(true)}
      >
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={`p-1.5 rounded-md bg-primary/10`}>
              <Icon className={"h-4 w-4 text-primary"} />
            </div>
          )}
          <span className="font-medium text-black">{label}</span>
        </div>
        <Menu className="h-5 w-5 text-muted-foreground" />
      </Button>
      <UserSideNav
        openSideMenu={openSideMenu}
        setOpenSideMenu={setOpenSideMenu}
        pathSegments={activeSegment!}
      />
    </div>
  );
};

export default UserNavButton;
