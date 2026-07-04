"use client";

import { useState } from "react";
import { createVarietyAction } from "@/actions/admin-products";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function CreateVarietyDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation(); // 👈 Stops the submit event from bubbling up to the parent form

    setLoading(true);

    const result = await createVarietyAction({
      name,
      description,
      order: parseInt(order, 10) || 0,
    });
    setLoading(false);

    if (result.success) {
      toast.success("Variety option created successfully! 📐");
      setName("");
      setDescription("");
      setOrder("");
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to create variety.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="gap-2 h-9 cursor-pointer"
        >
          <Plus className="size-4" /> Add Variety
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Menu Variety Option</DialogTitle>
          <DialogDescription>
            Create a new reusable portion Variety option.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* --- In both CreateVarietyDialog.tsx and CreateIngredientDialog.tsx --- */}

          {/* Add a two-column grid under the name input */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="variety-name">Variety Name</Label>
              <Input
                id="variety-name"
                placeholder="e.g. Organic Harvest"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="variety-order">Display Order</Label>
              <Input
                id="variety-order"
                type="number"
                min={0}
                placeholder="0"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="variety-desc">Description</Label>
            <Textarea
              id="variety-desc"
              placeholder="Brief Variety details..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none break-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              className="cursor-pointer"
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[100px] cursor-pointer"
            >
              {loading && <Loader2 className="size-4 animate-spin mr-2" />} Save
              Variety
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
