"use client";
import { useSelectedLayoutSegment } from "next/navigation";
import React from "react";

export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const segment = useSelectedLayoutSegment();
  return (
    <div
      key={segment}
      className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both ${className}`}
    >
      {children}
    </div>
  );
}
