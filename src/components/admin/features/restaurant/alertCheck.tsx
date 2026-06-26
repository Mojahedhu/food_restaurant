import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

interface AlertCheckProps {
  isUnsavedChangesDialogOpen: boolean;
  confirmLinkSchedule: (shouldDiscard: boolean) => void;
}

function AlertCheck({
  isUnsavedChangesDialogOpen,
  confirmLinkSchedule,
}: AlertCheckProps) {
  return (
    <AlertDialog
      open={isUnsavedChangesDialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          confirmLinkSchedule(false); // User closed/canceled
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved changes detected</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes in your weekly schedule configuration.
            Switching templates now will discard these modifications. Do you
            want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => confirmLinkSchedule(false)}
            className="hover:cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => confirmLinkSchedule(true)}
            className="hover:cursor-pointer"
          >
            Discard changes & Switch
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AlertCheck;
