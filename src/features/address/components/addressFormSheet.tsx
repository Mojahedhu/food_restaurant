"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { Home, Building, MapPin, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Address } from "../../../../types/sanityTypes";

type Mode = "create" | "update";

interface AddressSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: Mode;
  userId: string;
  addressId?: string;
  initialData?: Address | null;
  loading: boolean;
  onSubmit: (
    data: Omit<Address, "_id"> | Address,
  ) => Promise<{ success: boolean }>;
}

export default function AddressSheet({
  open,
  setOpen,
  mode,
  userId,
  loading,
  onSubmit,
  initialData,
}: AddressSheetProps) {
  const [type, setType] = useState(initialData?.type || "Home");

  const [form, setForm] = useState<Partial<Address>>({
    label: initialData?.label || "",
    street: initialData?.street || "",
    apartment: initialData?.apartment || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zipCode: initialData?.zipCode || "",
    phone: initialData?.phone || "",
    instructions: initialData?.instructions || "",
    isDefault: initialData?.isDefault || false,
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(initialData);
      setType(initialData.type || "Home");
    }
  }, [initialData]);

  const handleChange = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const result = await onSubmit({
      ...form,
      type,
    });
    if (result.success) {
      setOpen(false);
      setForm({
        label: "",
        street: "",
        apartment: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        instructions: "",
        isDefault: false,
      });
      setType("home");
    }
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full p-6 sm:max-w-xl md:max-w-2xl lg:max-w-4xl overflow-y-auto"
      >
        <SheetHeader className="space-y-2 text-center sm:text-left p-0">
          <SheetTitle className="text-lg font-semibold text-foreground">
            {mode === "create" ? "Add New Address" : "Update Address"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Add a delivery address for faster checkout"
              : "Update your delivery address"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          {/* Address Type */}
          <div className="space-y-2">
            <Label>Address Type</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-md border-2 p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-input",
                  type === "home"
                    ? "border-primary bg-primary/10"
                    : "hover:border-primary/30",
                )}
                onClick={() => setType("home")}
              >
                <Home className="mr-2 h-4 w-4" /> Home
              </button>

              <button
                type="button"
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-md border-2 p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-input",
                  type === "work"
                    ? "border-primary bg-primary/10"
                    : "hover:border-primary/30",
                )}
                onClick={() => setType("work")}
              >
                <Building className="mr-2 h-4 w-4" /> Work
              </button>

              <button
                type="button"
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-md border-2 p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-input",
                  type === "other"
                    ? "border-primary bg-primary/10"
                    : "hover:border-primary/30",
                )}
                onClick={() => setType("other")}
              >
                <MapPin className="mr-2 h-4 w-4" /> Other
              </button>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-2">
            <Label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="label"
            >
              Label (optional)
            </Label>

            <Input
              id="label"
              value={form.label}
              onChange={(e) => handleChange("label", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g., Mom's House, Office"
            />
          </div>

          <div className="space-y-2">
            <Label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="street"
            >
              Street
            </Label>
            <Input
              id="street"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="123 Main Street"
              required
              value={form.street}
              onChange={(e) => handleChange("street", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="apartment"
            >
              Apartment, Suite, etc. (optional)
            </Label>
            <Input
              id="apartment"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Apt 4B"
              value={form.apartment}
              onChange={(e) => handleChange("apartment", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="city"
            >
              City
            </Label>
            <Input
              id="city"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="New York"
              required
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="state"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                State
              </label>
              <Input
                id="state"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="NY"
                required
                value={form.state}
                onChange={(e) => handleChange("state", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="zipCode"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Zip Code
              </label>
              <Input
                id="zipCode"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="10001"
                required
                value={form.zipCode}
                onChange={(e) => handleChange("zipCode", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              id="phone"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Phone Number
            </Label>
            <Input
              id="phone"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="+1 [555] 000-0000"
              required
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              For delivery coordination
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="instructions"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Delivery Instructions (optional)
            </Label>
            <Textarea
              id="instructions"
              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              maxLength={150}
              value={form.instructions}
              onChange={(e) => handleChange("instructions", e.target.value)}
            />
          </div>

          {/* Default */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isDefault"
              className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              checked={form.isDefault}
              onCheckedChange={(val) => {
                handleChange("isDefault", val);
              }}
            />
            <Label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="isDefault"
            >
              Set as default delivery address
            </Label>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row  sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : mode === "create" ? (
                "Save Address"
              ) : (
                "Update Address"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
