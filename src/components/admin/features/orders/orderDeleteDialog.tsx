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

interface OrderDeleteDialogProps {
  deletingOrderId: string | null;
  setDeletingOrderId: (value: string | null) => void;
  handleDeleteOrder: (orderId: string) => Promise<void>;
  isPending: boolean;
}

function OrderDeleteDialog({
  deletingOrderId,
  setDeletingOrderId,
  handleDeleteOrder,
  isPending,
}: OrderDeleteDialogProps) {
  return (
    <AlertDialog
      open={!!deletingOrderId}
      onOpenChange={(open) => !open && setDeletingOrderId(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="font-semibold">
            This action cannot be undone. This will permanently delete order #
            {deletingOrderId?.slice(0, 8).toUpperCase()} from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive! text-destructive-foreground! hover:bg-destructive/90! cursor-pointer"
            disabled={isPending}
            onClick={async () => {
              if (deletingOrderId) {
                await handleDeleteOrder(deletingOrderId);
                setDeletingOrderId(null);
              }
            }}
          >
            {isPending ? "Deleting..." : "Confirm Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default OrderDeleteDialog;
