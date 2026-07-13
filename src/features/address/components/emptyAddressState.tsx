import { MapPinOff } from "lucide-react";

interface EmptyAddressStateProps {
  title?: string;
  description?: string;
}

export const EmptyAddressState = ({
  title = "No addresses found",
  description = "You don't have any saved addresses yet. Add one to get started.",
}: EmptyAddressStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed bg-muted/20">
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
        <MapPinOff className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
        {description}
      </p>
    </div>
  );
};
