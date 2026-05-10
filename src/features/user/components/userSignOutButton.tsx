"use client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const UserSignOutButton = () => {
  return (
    <Button
      variant="outline"
      size={"lg"}
      className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors px-3 py-2 cursor-pointer"
      onClick={() => signOut()}
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
};

export default UserSignOutButton;
