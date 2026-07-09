import React from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
      {children}
    </div>
  );
}
