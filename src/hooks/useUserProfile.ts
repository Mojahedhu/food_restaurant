import {
  UpdateProfilePayload,
  updateUserProfileAction,
} from "@/actions/client-user-profile";
import { toast } from "sonner";
import { useOptimistic, useRef, useState } from "react";

import { useLiveUser } from "./useLiveUser";
import { User } from "@/../types/sanityTypes";

export function useUserProfile(user: User) {
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

  useLiveUser(serverUser?._id, setServerUser);

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
  return {
    openForm,
    setOpenForm,
    serverUser,
    optimisticUser,
    handleOptimisticUpdate,
    name,
    isAdmin,
  };
}
