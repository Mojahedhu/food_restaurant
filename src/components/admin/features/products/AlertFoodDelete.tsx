"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AlertFoodDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  isPending: boolean;
}

export function AlertFoodDelete({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isPending,
}: AlertFoodDeleteProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-slate-900">
            Confirm Product Deletion
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground mt-2 font-semibold">
            Are you absolutely sure you want to delete{" "}
            <strong>{productName}</strong>? This will permanently purge this
            dish from the menu catalog and website.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel disabled={isPending} onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={onConfirm}
            className="bg-destructive! text-destructive-foreground! hover:bg-destructive/90!"
          >
            {isPending ? "Deleting..." : "Delete Food"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
