import React from "react";
import UserBreadcrumb from "../../../features/user/components/userBreadcrumb";
import UserNav from "../../../features/user/components/userNav";

import UserNavButton from "../../../features/user/components/userNavButton";
import UserSignOutButton from "../../../features/user/components/userSignOutButton";

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-linear-to-b from-primary/5 via-background to-background">
      <UserBreadcrumb />
      <div className="border-b bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <UserNav />
            <UserNavButton />
            <UserSignOutButton />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default UserLayout;
