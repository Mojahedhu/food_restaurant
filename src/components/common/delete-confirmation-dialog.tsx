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
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  title?: string;
  description?: React.ReactNode;
  cancelText?: string;
  actionText?: string;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete this item and remove its data from our servers.",
  cancelText = "Cancel",
  actionText = "Delete",
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={!isDeleting ? onOpenChange : undefined}
    >
      <AlertDialogContent className="max-w-md sm:max-w-[425px]">
        <div className="flex flex-col items-center gap-4 py-4 text-center sm:py-2">
          {/* Animated Warning Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-4 border-destructive/20 relative">
            <div className="absolute inset-0 rounded-full animate-ping bg-destructive/10"></div>
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>

          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-center">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left text-muted-foreground pt-2 font-semibold">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className="sm:justify-evenly gap-3 mt-4">
          <AlertDialogCancel
            disabled={isDeleting}
            className="w-full sm:w-32 border-2 hover:bg-muted font-medium transition-colors"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="w-full sm:w-32 bg-destructive! text-destructive-foreground! hover:bg-destructive/90! shadow-lg shadow-destructive/20! font-semibold transition-all"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              actionText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
