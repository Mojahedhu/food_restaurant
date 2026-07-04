"use client";

import { useState } from "react";
import { createSizeAction } from "@/actions/admin-products";
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

export function CreateSizeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [serveSize, setServeSize] = useState("1");
  const [order, setOrder] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation(); // 👈 Stops the submit event from bubbling up to the parent form

    setLoading(true);

    const result = await createSizeAction({
      name,
      code,
      description,
      serveSize: parseInt(serveSize, 10) || 1,
      order: parseInt(order, 10) || 0,
    });
    setLoading(false);

    if (result.success) {
      toast.success("Size option created successfully! 📐");
      setName("");
      setCode("");
      setDescription("");
      setServeSize("1");
      setOrder("");
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to create size.");
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
          <Plus className="size-4" /> Add Size
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Menu Size Option</DialogTitle>
          <DialogDescription>
            Create a new reusable portion size option.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size-name">Size Name</Label>
              <Input
                id="size-name"
                placeholder="e.g. Extra Large"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size-code">Size Code</Label>
              <Input
                id="size-code"
                placeholder="e.g. XL"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size-serve">Serves (people)</Label>
              <Input
                id="size-serve"
                type="number"
                min={1}
                value={serveSize}
                onChange={(e) => setServeSize(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size-order">Display Order</Label>
              <Input
                id="size-order"
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="size-desc">Description</Label>
            <Textarea
              id="size-desc"
              placeholder="Brief size details..."
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
              Size
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
