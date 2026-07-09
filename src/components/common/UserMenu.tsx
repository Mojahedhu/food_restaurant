import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LogOut, Settings, ShieldCheck, User } from "lucide-react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

const UserMenu = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />;
  }

  if (session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center justify-center
            border p-1.5 border-muted-foreground/30 rounded-full
            hover:bg-muted hover:border-primary transition-all
            focus:outline-none focus:ring-2 focus:ring-primary
            focus:ring-offset-2 cursor-pointer"
          >
            {session?.user?.image ? (
              <Image
                src={
                  typeof session.user.image === "object"
                    ? urlFor(session?.user?.image).url()
                    : session?.user?.image
                }
                alt={"User Image"}
                width={30}
                height={30}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session?.user?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={"/user/dashboard"} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" /> <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={"/user/settings"} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" /> <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          {session?.user?.role === "admin" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={"/admin"} className="cursor-pointer">
                  <ShieldCheck className="mr-2 w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer "
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span className="text-red-600 focus:text-red-700">Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div>
        <Link href={"/auth/signin"} scroll={false}>
          <button className="border border-primary px-5 py-2.5 rounded-full text-xs font-medium relative overflow-hidden hover-effect group">
            <span className="absolute inset-0 w-full -translate-y-full h-full rounded-full bg-primary group-hover:translate-y-0 hover-effect" />
            <span className="relative  z-10 text-primary group-hover:text-white hover-effect">
              Sign In
            </span>
          </button>
        </Link>
      </div>
      <div>
        <Link href={"/auth/signup"} scroll={false}>
          <button className="relative border border-primary px-5 py-2.5 rounded-full text-xs font-medium overflow-hidden group">
            <span className="absolute inset-0 bg-primary w-full h-full rounded-full group-hover:translate-y-full hover-effect" />
            <span className="relative z-10 text-white group-hover:text-primary hover-effect">
              Sign Up
            </span>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default UserMenu;
