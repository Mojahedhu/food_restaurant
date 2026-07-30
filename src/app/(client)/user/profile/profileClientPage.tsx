"use client";
import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";
import ProfileForm from "./_components/profileForm";
import { User } from "@/../types/sanityTypes";
import { useUserProfile } from "@/hooks/useUserProfile";
import ProfileInfo from "./_components/profileInfo";
import ProfileSettings from "./_components/profileSettings";
import DangerZone from "./_components/dangerZone";

interface ProfileClientPageProps {
  user: User;
}

const ProfileClientPage = ({ user }: ProfileClientPageProps) => {
  const {
    openForm,
    setOpenForm,
    serverUser,
    optimisticUser,
    handleOptimisticUpdate,
    name,
    isAdmin,
  } = useUserProfile(user);

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
          {/* profile info */}

          <ProfileInfo
            optimisticUser={optimisticUser}
            serverUser={serverUser}
            name={name}
            isAdmin={isAdmin}
          />
          {/* Profile Settings */}
          <ProfileSettings />

          {/* Danger Zone */}
          <DangerZone />
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
