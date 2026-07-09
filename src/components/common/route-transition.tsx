"use client";

import { usePathname } from "next/navigation";
import React from "react";

export function RouteTransition({
  children,
  className = "animate-page-enter",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  // The key={pathname} forces React to remount the div on every route change,
  // triggering the CSS animation reliably.
  return (
    <div key={pathname} className={className}>
      {children}
    </div>
  );
}
