import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { AlertTriangle, Trash2, X } from "lucide-react";
interface ClearAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClearCart: () => void;
  itemsLength: number;
}
const ClearAlertDialog = ({
  open,
  onOpenChange,
  onClearCart,
  itemsLength,
}: ClearAlertDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-4 border-destructive/20">
            <AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
          </div>
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-xl font-bold text-center mx-auto">
              Clear Cart
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center leading-relaxed">
              You&apos;re about to remove{" "}
              <span className="font-semibold text-destructive">
                {itemsLength} {itemsLength === 1 ? "item" : "items"}
              </span>{" "}
              from your cart. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-4">
          <AlertDialogCancel className="flex-1 m-0 border-2 hover:bg-muted font-medium px-3 py-2">
            Keep Items
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onClearCart}
            buttonClassName="flex-1 m-0 bg-destructive hover:bg-destructive/90 focus:ring-destructive font-semibold shadow-lg hover:shadow-destructive/20 px-3 py-2"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ClearAlertDialog;
