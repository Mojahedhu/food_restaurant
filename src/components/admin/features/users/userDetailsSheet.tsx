"use client";

import { useEffect, useState, useTransition } from "react";
import { UserSummary, OrderSummary, AddressSummary } from "@/types/admin";
import { fetchUserAddresses, fetchUserOrders } from "@/actions/admin-users";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Minus, Home, Briefcase, MapPin } from "lucide-react";

interface UserDetailsSheetProps {
  user: UserSummary | null;
  roles: Array<{ _id: string; name: string }>;
  isOpen: boolean;
  onClose: () => void;
  onSaveDetails: (
    userId: string,
    updates: { name: string; phoneNumber: string; bio: string },
  ) => Promise<void>;
  onUpdateRole: (
    userId: string,
    roleRefId: string,
    roleName: string,
  ) => Promise<void>;
  onAdjustWallet: (userId: string, amount: number) => Promise<void>;
  isPending: boolean;
}

export function UserDetailsSheet({
  user,
  roles,
  isOpen,
  onClose,
  onSaveDetails,
  onUpdateRole,
  onAdjustWallet,
  isPending,
}: UserDetailsSheetProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const [walletAdjustment, setWalletAdjustment] = useState("");
  const [addresses, setAddresses] = useState<AddressSummary[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loadingContext, startLoadingContext] = useTransition();

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(user.name || "");
      setPhone(user.phoneNumber || "");
      setBio(user.bio || "");
      setWalletAdjustment("");

      startLoadingContext(async () => {
        const [addr, ord] = await Promise.all([
          fetchUserAddresses(user._id),
          fetchUserOrders(user.email || ""),
        ]);
        setAddresses(addr);
        setOrders(ord);
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSave = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSaveDetails(user._id, { name, phoneNumber: phone, bio });
  };

  const handleAdjustWalletSubmit = async (type: "add" | "deduct") => {
    const amt = parseFloat(walletAdjustment);
    if (isNaN(amt) || amt <= 0) return;
    const finalAmount = type === "add" ? amt : -amt;
    await onAdjustWallet(user._id, finalAmount);
    setWalletAdjustment("");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md lg:max-w-xl flex flex-col h-full p-6">
        <SheetHeader className="text-left mb-4">
          <SheetTitle className="text-2xl font-bold">
            User Profile details
          </SheetTitle>
          <SheetDescription>
            Inspect and update customer metadata, role authorization, and wallet
            credits.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          <div className="px-1">
            {/* General Metadata */}
            <form onSubmit={handleSave} className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Account Details
              </h3>

              <div className="space-y-2">
                <Label htmlFor="usr-name">Full Name</Label>
                <Input
                  id="usr-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usr-email">Email Address</Label>
                <Input
                  id="usr-email"
                  value={user.email || ""}
                  disabled
                  className="bg-slate-50 text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usr-phone">Phone Number</Label>
                <Input
                  id="usr-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10 digit phone number"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usr-bio">Bio / Description</Label>
                <Textarea
                  id="usr-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  maxLength={200}
                  className="resize-none"
                  disabled={isPending}
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full hover:cursor-pointer"
              >
                {isPending && <Loader2 className="size-4 animate-spin mr-2" />}
                Save General Details
              </Button>
            </form>

            <Separator />

            {/* Role Management */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Role Access
              </h3>
              <div className="space-y-2">
                <Label>Access Level</Label>
                <Select
                  value={user.role?._id || ""}
                  onValueChange={(val) => {
                    const roleObj = roles.find((r) => r._id === val);
                    if (roleObj) {
                      onUpdateRole(user._id, val, roleObj.name);
                    }
                  }}
                  disabled={isPending}
                >
                  <SelectTrigger className="bg-background hover:cursor-pointer">
                    <SelectValue placeholder="No assigned role" />
                  </SelectTrigger>
                  <SelectContent>
                    {(roles || []).map((r) => (
                      <SelectItem key={r._id} value={r._id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Wallet Balance Adjuster */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Store Credit / Wallet
              </h3>
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-sm font-medium">Current Balance:</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(user.walletBalance || 0)}
                </span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet-adj">Adjust Balance ($)</Label>
                <div className="flex gap-2">
                  <Input
                    id="wallet-adj"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={walletAdjustment}
                    onChange={(e) => setWalletAdjustment(e.target.value)}
                    disabled={isPending}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 text-emerald-500 hover:cursor-pointer"
                    onClick={() => handleAdjustWalletSubmit("add")}
                    disabled={isPending || !walletAdjustment}
                  >
                    <Plus className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 border-destructive/20 hover:bg-destructive/10 text-destructive hover:cursor-pointer"
                    onClick={() => handleAdjustWalletSubmit("deduct")}
                    disabled={isPending || !walletAdjustment}
                  >
                    <Minus className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Addresses Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Saved Addresses
            </h3>
            {loadingContext ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin" /> Fetching
                addresses...
              </div>
            ) : (addresses || []).length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No addresses saved for this customer.
              </p>
            ) : (
              <div className="space-y-2">
                {(addresses || []).map((addr) => (
                  <div
                    key={addr._id}
                    className="flex gap-3 p-3 border rounded-xl hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="size-8 rounded-lg bg-secondary/80 flex items-center justify-center shrink-0 mt-0.5">
                      {addr.type === "home" ? (
                        <Home className="size-4 text-primary" />
                      ) : addr.type === "work" ? (
                        <Briefcase className="size-4 text-primary" />
                      ) : (
                        <MapPin className="size-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold capitalize">
                          {addr.label || addr.type}
                        </span>
                        {addr.isDefault && (
                          <Badge
                            variant="outline"
                            className="bg-primary/5 border-primary/20 text-primary scale-90 px-1 py-0 font-normal"
                          >
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {addr.street}
                        {addr.apartment ? `, ${addr.apartment}` : ""},{" "}
                        {addr.city}, {addr.state} {addr.zipCode}
                      </p>
                      <p className="text-xs text-slate-500">
                        Phone: {addr.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Orders Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Recent Orders
            </h3>
            {loadingContext ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin" /> Fetching orders...
              </div>
            ) : (orders || []).length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No orders recorded for this customer.
              </p>
            ) : (
              <div className="divide-y border rounded-xl overflow-hidden bg-background">
                {(orders || []).map((ord) => (
                  <div
                    key={ord._id}
                    className="flex justify-between items-center p-3 text-sm hover:bg-slate-50/30"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        Order #{ord.orderNumber}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(ord._createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-950">
                        {formatCurrency(ord.total || 0)}
                      </div>
                      <Badge
                        variant="outline"
                        className="scale-90 font-normal mt-0.5"
                      >
                        {ord.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
