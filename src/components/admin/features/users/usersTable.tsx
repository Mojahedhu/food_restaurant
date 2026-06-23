"use client";

import { useState } from "react";
import { UserSummary } from "@/types/admin";
import { useUsersLogic } from "@/hooks/useUsersLogic";
import { formatCurrency, getUserImage } from "@/lib/utils";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, UserIcon } from "lucide-react";
import { UserDetailsSheet } from "./userDetailsSheet";
import Image from "next/image";
import { User } from "../../../../../types/sanityTypes";

interface UsersTableProps {
  initialUsers: UserSummary[];
  roles: Array<{ _id: string; name: string }>;
}

export function UsersTable({ initialUsers, roles }: UsersTableProps) {
  const {
    users,
    isPending,
    handleUpdateRole,
    handleSaveDetails,
    handleAdjustWallet,
  } = useUsersLogic(initialUsers);

  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);

  // Synchronize local selection item with override updates dictionary
  const activeSelection = selectedUser
    ? users.find((u) => u._id === selectedUser._id) || selectedUser
    : null;

  return (
    <div className="relative w-full overflow-auto">
      {isPending && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/80 animate-pulse z-50" />
      )}

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-transparent border-b">
            <TableHead className="w-[60px] pl-4">User</TableHead>
            <TableHead>Name & Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Wallet Credit</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right pr-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(users || []).map((user) => {
            const hasWallet = (user.walletBalance || 0) > 0;
            const src = getUserImage(user as Partial<User>);
            return (
              <TableRow
                key={user._id}
                className="hover:bg-slate-50/50 transition-colors border-b last:border-b-0"
              >
                {/* Avatar Icon */}
                <TableCell className="pl-4">
                  <div className="relative size-10 rounded-full border border-border bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {src ? (
                      <Image
                        src={src}
                        alt={user.name || "food-lover"}
                        fill
                        sizes="20px"
                        className="object-cover"
                      />
                    ) : (
                      <UserIcon className="size-5 text-muted-foreground/60" />
                    )}
                  </div>
                </TableCell>

                {/* Account Name/Email */}
                <TableCell>
                  <div className="font-semibold text-slate-900">
                    {user.name || "Unnamed"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {user.email}
                  </div>
                </TableCell>

                {/* Role Badge */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      user.role?.slug === "admin"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : user.role?.slug === "delivery_boy"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                    }
                  >
                    {user.role?.name || "User"}
                  </Badge>
                </TableCell>

                {/* Phone */}
                <TableCell className="text-muted-foreground">
                  {user.phoneNumber || "—"}
                </TableCell>

                {/* Wallet Balance */}
                <TableCell
                  className={
                    hasWallet
                      ? "font-bold text-slate-900"
                      : "text-muted-foreground"
                  }
                >
                  {formatCurrency(user.walletBalance || 0)}
                </TableCell>

                {/* Joined Datetime */}
                <TableCell className="text-muted-foreground">
                  {user._createdAt
                    ? format(new Date(user._createdAt), "MMM d, yyyy")
                    : "—"}
                </TableCell>

                {/* Edit Action Button */}
                <TableCell className="text-right pr-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedUser(user)}
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors"
                    disabled={isPending}
                  >
                    <Edit className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <UserDetailsSheet
        user={activeSelection}
        roles={roles}
        isOpen={!!activeSelection}
        onClose={() => setSelectedUser(null)}
        onSaveDetails={handleSaveDetails}
        onUpdateRole={handleUpdateRole}
        onAdjustWallet={(_, handleAdjustWalletSubmit) =>
          handleAdjustWallet(
            activeSelection?._id || "",
            handleAdjustWalletSubmit,
          )
        }
        isPending={isPending}
      />
    </div>
  );
}
