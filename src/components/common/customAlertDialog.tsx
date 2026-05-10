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
import { AlertTriangle } from "lucide-react";
interface CustomAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClearCart: () => void;
  showAlertIcon?: boolean;
  title?: string;
  description?: React.ReactNode;
  cancelText?: string;
  actionText?: string;
}

const title_default = "Clear Cart";
const description_default = (
  <>
    You&apos;re about to remove{" "}
    <span className="font-semibold text-destructive">some items</span> from your
    cart. This action cannot be undone.
  </>
);
const cancelText_default = "Keep Items";
const actionText_default = "Clear Cart";
const CustomAlertDialog = ({
  open,
  onOpenChange,
  onClearCart,
  title = title_default,
  description = description_default,
  cancelText = cancelText_default,
  actionText = actionText_default,
  showAlertIcon = false,
}: CustomAlertDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md!">
        <div className="text-center space-y-4">
          {showAlertIcon && (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-4 border-destructive/20">
              <AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
            </div>
          )}
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[18px] mb-2 font-semibold text-right">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left leading-tight">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter className="flex-col sm:flex-row gap-3">
          <AlertDialogCancel
            size={"lg"}
            className="m-0 border-2 hover:bg-muted font-medium px-4 py-2"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onClearCart}
            size={"lg"}
            buttonClassName="m-0 bg-destructive hover:bg-destructive/90 focus:ring-destructive font-semibold shadow-lg hover:shadow-destructive/20 px-4 py-2"
          >
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CustomAlertDialog;
