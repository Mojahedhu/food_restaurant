import UserBreadcrumb from "@/features/user/components/userBreadcrumb";
import UserNav from "@/features/user/components/userNav";

import UserNavButton from "@/features/user/components/userNavButton";
import UserSignOutButton from "@/features/user/components/userSignOutButton";
import auth from "@/../auth";
import { redirect } from "next/navigation";

async function UserLayout({ children }: { children: React.ReactNode }) {
  // Zero-trust authentication guard
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 via-background to-background">
      <UserBreadcrumb />

      {/* Sticky, isolated navigation shell */}
      <div className="border-b bg-card/90 backdrop-blur-sm sticky top-16 z-30 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <UserNav />
            <div className="flex items-center gap-3">
              <UserNavButton />
              <UserSignOutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
        {children}
      </div>
    </div>
  );
}

export default UserLayout;
