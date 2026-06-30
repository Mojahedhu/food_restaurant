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
import { UserSummary } from "@/types/admin";
interface UserDeleteDialogProps {
  deletingUser: UserSummary | null;
  setDeletingUser: (user: UserSummary | null) => void;
  handleDeleteUser: (userId: string) => Promise<void>;
  isPending: boolean;
}

function UserDeleteDialog({
  deletingUser,
  setDeletingUser,
  handleDeleteUser,
  isPending,
}: UserDeleteDialogProps) {
  // 3. Add AlertDialog component at the bottom of the table container:
  return (
    <AlertDialog
      open={!!deletingUser}
      onOpenChange={(open) => !open && setDeletingUser(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the account of{" "}
            <strong>{deletingUser?.name || "Unnamed"}</strong> (
            {deletingUser?.email}) from the restaurant database. This action
            cannot be undone.
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
              if (deletingUser) {
                await handleDeleteUser(deletingUser._id);
                setDeletingUser(null);
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

export default UserDeleteDialog;
