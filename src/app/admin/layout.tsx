import { ReactNode } from "react";
import { ViewTransitions } from "next-view-transitions";
import { Sidebar } from "@/components/admin/layout/sidebar";
import { Header } from "@/components/admin/layout/header";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    // ViewTransitions enables the smart routing navigation API
    <ViewTransitions>
      {/* Mobile-first layout: column by default, flex row on lg screens */}
      <div className="flex h-screen w-full bg-background overflow-hidden flex-col lg:flex-row">
        {/* Desktop Sidebar (Hidden on sm/md, visible on lg/xl) */}
        <Sidebar className="hidden lg:flex" />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 w-full overflow-hidden">
          {/* Top Header */}
          <Header />

          {/* Scrollable Page Content with Smart Animation */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ViewTransitions>
  );
}
