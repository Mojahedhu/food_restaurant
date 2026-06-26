import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface DeleteDialogProps {
  openingHoursId: string;

  handleDeleteSchedule: (id: string) => Promise<boolean>;
  isPending: boolean;
}
function AlertDeletion({
  openingHoursId,
  handleDeleteSchedule,
  isPending,
}: DeleteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          className="gap-1 cursor-pointer hover:cursor-pointer animate-in fade-in-50 duration-200"
          disabled={isPending}
          onClick={() => setIsOpen(true)}
        >
          Delete template
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <p className="text-justify tracking-tighter mt-1">
              This will permanently delete the custom template. Any restaurants
              currently using it will automatically revert to &quot;Standard
              Hours&quot; to avoid broken references. This action cannot be
              undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            className="hover:cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={async (e) => {
              e.preventDefault(); // Prevent closing immediately before action finishes
              const success = await handleDeleteSchedule(openingHoursId);
              if (success) {
                setIsOpen(false); // Close dialog on success
              }
            }}
            className="hover:cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>Yes, delete template</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AlertDeletion;
