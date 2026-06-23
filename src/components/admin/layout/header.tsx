"use client";

import { useState } from "react";
import { Link } from "next-view-transitions";
import { ArrowLeft, Menu } from "lucide-react";
import { Sidebar } from "./sidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b bg-card z-10 shadow-sm">
      {/* Mobile Menu Toggle (Visible on sm/md, hidden on lg/xl) */}
      <div className="lg:hidden flex items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="hover:cursor-pointer!" asChild>
            <button className="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors ">
              <Menu className="size-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            {/* Required by accessibility standards */}

            <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
            <SheetDescription className="sr-only">
              sidebar for mobile
            </SheetDescription>
            {/* Render the identical sidebar but tell it to close the sheet on navigate */}
            <Sidebar className="flex" onNavigate={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Empty div for spacing if mobile menu is hidden on desktop */}
      <div className="hidden lg:block"></div>

      {/* Right side actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Visual Badge representing admin status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-accent">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Admin
        </div>

        {/* Back to site link */}
        <Link
          href="/"
          className="flex items-center gap-1.5 sm:gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          <span className="hidden sm:inline">Back to Site</span>
          <span className="sm:hidden">Exit</span>
        </Link>
      </div>
    </header>
  );
}
