"use client";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { usePathname } from "next/navigation";

const UserBreadcrumb = () => {
  const pathname = usePathname();
  const pathnameList = pathname.split("/");

  if (pathnameList.length <= 2 || pathnameList[2] === "dashboard") {
    return (
      <>
        <Breadcrumb
          items={[
            {
              label: "User Dashboard",
              href: "/user",
            },
          ]}
        />
      </>
    );
  }

  if (pathnameList.length <= 3) {
    const pathSegments = pathnameList[2];
    return (
      <>
        <Breadcrumb
          items={[
            {
              label: "User Dashboard",
              href: "/user",
            },
            {
              label:
                pathSegments?.charAt(0).toUpperCase() + pathSegments?.slice(1),
              href: `/user/${pathSegments}`,
            },
          ]}
        />
      </>
    );
  } else {
    const pathSegments = pathnameList[3];
    return (
      <>
        <Breadcrumb
          items={[
            {
              label: "User Dashboard",
              href: "/user",
            },
            {
              label: "Orders",
              href: "/user/orders",
            },
            {
              label: `Order Details`,
              href: `/user/orders/${pathSegments}`,
            },
          ]}
        />
      </>
    );
  }
};

export default UserBreadcrumb;
