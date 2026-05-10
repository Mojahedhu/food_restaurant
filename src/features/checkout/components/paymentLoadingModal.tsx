import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"; // Path to your shadcn alert-dialog
import { Package } from "lucide-react";

interface PaymentLoadingModalProps {
  isOpen: boolean;
  orderLoading: null | "processing" | "connecting";
}

export default function PaymentLoadingModal({
  isOpen,
  orderLoading,
}: PaymentLoadingModalProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md rounded-lg p-6 shadow-2xl border-border bg-card">
        <div className="flex flex-col space-y-4 text-center">
          {/* Animated Icon Header */}
          <div className="flex justify-center mb-4">
            <div className="relative h-16 w-16">
              {/* The Static Background Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-muted opacity-20" />

              {/* The Animated Spinning Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />

              {/* The Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <AlertDialogHeader className="space-y-4">
            <AlertDialogTitle className="text-center text-xl font-semibold">
              {orderLoading === null && <>Processing Order</>}
              {orderLoading === "connecting" && <>Preparing Payment</>}
              {orderLoading === "processing" && <>Redirecting</>}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base text-muted-foreground">
              {orderLoading === null && (
                <>Please wait while we creating your order...</>
              )}
              {orderLoading === "connecting" && (
                <>
                  Connecting to secure payment gateway. You will be redirected
                  shortly...
                </>
              )}
              {orderLoading === "processing" && (
                <>Redirecting you to stripe for secure payment...</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
