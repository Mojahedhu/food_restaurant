"use client";

import { useTransition, useState, useEffect } from "react";
import { UserSummary } from "@/types/admin";
import {
  updateUserRoleAction,
  saveUserDetailsAction,
  adjustUserWalletAction,
} from "@/actions/admin-users";
import { toast } from "sonner";
import { UserRoleReference } from "../../sanity.types";

export function useUsersLogic(initialUsers: UserSummary[]) {
  const [isPending, startTransition] = useTransition();
  const [localUpdates, setLocalUpdates] = useState<
    Record<string, Partial<UserSummary>>
  >({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalUpdates((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const userId in next) {
        const serverUser = initialUsers.find((u) => u._id === userId);
        const localUpdate = next[userId];

        if (serverUser) {
          const isRoleSynced =
            !localUpdate.role || serverUser.role?._id === localUpdate.role?._id;
          const isWalletSynced =
            localUpdate.walletBalance === undefined ||
            serverUser.walletBalance === localUpdate.walletBalance;

          if (isRoleSynced && isWalletSynced) {
            delete next[userId];
            changed = true;
          }
        }
      }

      return changed ? next : prev;
    });
  }, [initialUsers]);

  const users = (initialUsers || []).map((user) => {
    const update = localUpdates[user._id];
    return update ? { ...user, ...update } : user;
  });

  const handleUpdateRole = async (
    userId: string,
    roleRefId: string,
    roleName: string,
  ) => {
    setLocalUpdates((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        role: { _id: roleRefId, name: roleName } as UserRoleReference,
      },
    }));

    startTransition(async () => {
      const result = await updateUserRoleAction({ userId, roleRefId });
      if (result.success) {
        toast.success(`Role updated successfully!`);
      } else {
        toast.error(result.error || "Failed to update role. Reverting.");
        setLocalUpdates((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }
    });
  };

  const handleSaveDetails = async (
    userId: string,
    updates: { name: string; phoneNumber?: string; bio?: string },
  ) => {
    setLocalUpdates((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        name: updates.name,
        phoneNumber: updates.phoneNumber,
        bio: updates.bio,
      },
    }));

    startTransition(async () => {
      const result = await saveUserDetailsAction({ userId, ...updates });
      if (result.success) {
        toast.success("User details saved!");
      } else {
        toast.error(result.error || "Failed to save details. Reverting.");
        setLocalUpdates((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }
    });
  };

  const handleAdjustWallet = async (userId: string, amount: number) => {
    startTransition(async () => {
      const result = await adjustUserWalletAction({ userId, amount });
      if (result.success) {
        toast.success("Wallet balance updated successfully!");
        setLocalUpdates((prev) => ({
          ...prev,
          [userId]: {
            ...prev[userId],
            walletBalance: result.newBalance,
          },
        }));
      } else {
        toast.error(result.error || "Failed to adjust wallet.");
      }
    });
  };

  return {
    users,
    isPending,
    handleUpdateRole,
    handleSaveDetails,
    handleAdjustWallet,
  };
}
