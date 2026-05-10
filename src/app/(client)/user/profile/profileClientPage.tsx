"use client";
import { Button } from "@/components/ui/button";

import { Calendar, Mail, Shield, SquarePen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import ProfileForm from "./profileForm";
import { useOptimistic, useRef, useState } from "react";
import { User } from "../../../../../types/sanityTypes";

import { getUserImage } from "@/lib/utils";

import { UpdateProfilePayload, updateUserProfileAction } from "./action";
import { toast } from "sonner";
import { useLiveUser } from "@/hooks/useLiveUser";

interface ProfileClientPageProps {
  user: User;
}

const ProfileClientPage = ({ user }: ProfileClientPageProps) => {
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [serverUser, setServerUser] = useState<User>(user);
  /* Rollback snapshot */
  const RollbackRef = useRef<User>(user);
  const [optimisticUser, updateOptimisticUser] = useOptimistic(
    serverUser,
    (state: User, patch: Partial<User>) => ({
      ...state,
      ...patch,
    }),
  );

  useLiveUser(serverUser._id, setServerUser);

  const handleOptimisticUpdate = async (payload: UpdateProfilePayload) => {
    /* save current snapshot */
    RollbackRef.current = serverUser;

    /* instant UI Update */
    updateOptimisticUser(payload);
    setOpenForm(false);

    const result = await updateUserProfileAction({
      _id: serverUser._id,
      name: payload.name,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      bio: payload.bio,
      imageUrl: payload.imageUrl,
      imageFile: payload.imageFile,
    });

    /* Server Error Handling => Rollback */
    if (!result?.success) {
      setServerUser(RollbackRef.current);
      toast.error("Failed to update profile", {
        description: "Changes where reverted! Please try again",
      });
      setOpenForm(true);
      return;
    }

    toast.success("Profile updated successfully");
  };

  const name = optimisticUser.name;
  const isAdmin = optimisticUser?.role?._ref === "admin";
  console.log(serverUser);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="w-full">
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button variant={"outline"} onClick={() => setOpenForm(true)}>
              <SquarePen className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
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
                      {name?.split(" ")[0].charAt(0).toUpperCase() +
                        "-" +
                        name?.split(" ")[1].charAt(0).toUpperCase()}
                    </p>
                  )}
                </span>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">
                        {optimisticUser.name}
                      </h2>
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
          <Card>
            <CardHeader className="grid-rows-[auto_auto]">
              <CardTitle className="leading-none font-semibold">
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about your orders and promotions
                  </p>
                </div>
                <Button variant={"outline"}>Manage</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">
                    Change your password to keep your account secure
                  </p>
                </div>
                <Button variant={"outline"}>Change</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant={"outline"} className="px-3.5">
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-destructive!">
            <CardHeader className="grid-rows-[auto_auto]">
              <CardTitle className="text-destructive! leading-none font-semibold">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all your data
                  </p>
                </div>
                <Button
                  variant={"destructive"}
                  className="text-card bg-destructive/80 hover:text-card hover:bg-destructive"
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ProfileForm
        user={optimisticUser}
        open={openForm}
        setOpen={setOpenForm}
        onUpdate={handleOptimisticUpdate}
      />
    </div>
  );
};

export default ProfileClientPage;
