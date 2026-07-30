import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

function AddressInfo() {
  return (
    <Card className="text-card-foreground flex flex-col gap-6 rounded-xl border py-6 bg-muted/30 border-none shadow-none">
      <CardContent className="p-6 flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shrink-0 border">
          <MapPin className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <h4 className="font-medium text-[16px] mb-1">
            Why save delivery addresses?
          </h4>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Saving your addresses speeds up the checkout process. You can save
            your home, work, and other frequently used locations to switch
            between them easily when ordering.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default AddressInfo;
