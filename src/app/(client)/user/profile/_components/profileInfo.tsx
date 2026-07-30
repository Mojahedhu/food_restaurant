import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/../types/sanityTypes";
import { getUserImage } from "@/lib/utils";
import Image from "next/image";
import { Calendar, Mail, Shield } from "lucide-react";

interface ProfileInfoProps {
  optimisticUser: User;
  serverUser: User;
  name?: string;
  isAdmin: boolean;
}

function ProfileInfo({
  optimisticUser,
  serverUser,
  name,
  isAdmin,
}: ProfileInfoProps) {
  return (
    <Card>
      <CardHeader className="grid-rows-[auto_auto]">
        <CardTitle className="leading-none font-semibold">
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <span className="relative flex shrink-0 overflow-hidden rounded-full h-24 w-24">
            {optimisticUser.image ? (
              <Image
                src={getUserImage(optimisticUser) as string}
                alt={optimisticUser?.name || "User"}
                className="aspect-square h-full w-full"
                fill
                sizes="100%"
                loading="eager"
              />
            ) : (
              <p className="w-full h-full rounded-full bg-muted text-foreground flex items-center justify-center text-3xl font-semibold">
                {name
                  ? name?.split(" ")[0].charAt(0).toUpperCase() +
                    "-" +
                    name?.split(" ")[1].charAt(0).toUpperCase()
                  : "Unknown"}
              </p>
            )}
          </span>
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{optimisticUser.name}</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {isAdmin ? "Admin" : "Customer"}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {optimisticUser.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-muted-foreground">
                    {serverUser.role?._ref}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">User ID</p>
                  <p className="text-sm text-muted-foreground">
                    {optimisticUser._id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfileInfo;
