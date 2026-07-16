import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, CircleCheck, Mail, MapPin, Phone } from "lucide-react";
import OpeningSchedule from "./openingSchedule";
import { Restaurant } from "../../../../../../types/sanityTypes";

export default function RestaurantInfoSidebar({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  return (
    <div className="sticky top-24 space-y-6 animate-in slide-in-from-right-8 duration-700">
      <Card className="overflow-hidden border-border/50 shadow-sm">
        <div className="h-1.5 bg-primary w-full"></div>
        <CardHeader>
          <CardTitle className="leading-none font-semibold text-lg">
            Restaurant Info
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 space-y-6 pb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 border border-border/50 p-4 rounded-xl text-center shadow-sm">
              <span className="block text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                Time
              </span>
              <span className="font-bold text-xl text-foreground">
                {restaurant.estimatedDeliveryTime}{" "}
                <span className="text-sm font-medium text-muted-foreground">
                  min
                </span>
              </span>
            </div>
            <div className="bg-muted/30 border border-border/50 p-4 rounded-xl text-center shadow-sm">
              <span className="block text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                Fee
              </span>
              <span className="font-bold text-xl text-foreground">
                $
                {restaurant.deliveryFee ||
                  ((10 / 100) * restaurant.minimumOrder).toFixed(2)}
              </span>
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Address</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                  {restaurant.location?.address || "Address not available"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-foreground">Phone</p>
                <a
                  href={`tel:${restaurant.phone}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors mt-0.5 inline-block"
                >
                  {restaurant.phone || "Phone not available"}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-foreground">Email</p>
                <a
                  href={`mailto:${restaurant.email}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors mt-0.5 inline-block"
                >
                  {restaurant.email || "Email not available"}
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-semibold text-lg">
            <Calendar className="w-5 h-5 text-primary" />
            Opening Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="space-y-3">
            {restaurant.openingHours?.schedule?.map((schedule) => (
              <OpeningSchedule key={schedule.day} schedule={schedule} />
            ))}
            {!restaurant.openingHours?.schedule?.length && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Schedule not available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50/50 border-green-100/80 shadow-none">
        <CardContent className="p-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-green-700 text-sm font-semibold">
          <span className="flex items-center gap-1.5">
            <CircleCheck className="w-4 h-4 text-green-600" /> Verified Partner
          </span>
          <span className="flex items-center gap-1.5">
            <CircleCheck className="w-4 h-4 text-green-600" /> Safe Food
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
