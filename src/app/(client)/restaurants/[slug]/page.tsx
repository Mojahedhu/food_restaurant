import FoodCards from "@/components/foods/foodCards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRestaurantBySlug } from "@/lib/data/restaurants";
import { urlFor } from "@/sanity/lib/image";
import {
  Calendar,
  CircleCheck,
  Clock,
  DollarSign,
  Info,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Image from "next/image";
import OpeningSchedule from "./_components/openingSchedule";

import RestaurantPageSkeleton from "./loading";
import { isRestaurantOpen } from "@/lib/utils/schedule";
import { RouteTransition } from "@/components/common/route-transition";

async function RestaurantDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: restaurantSlug } = await params;
  const restaurantDetails = await getRestaurantBySlug(restaurantSlug);

  if (!restaurantDetails?.foodItems) {
    return <RestaurantPageSkeleton />;
  }
  const isOpen = isRestaurantOpen(restaurantDetails);

  return (
    <RouteTransition>
      <div className="min-h-screen bg-muted/10 pb-20">
        <div className="relative h-[400px] w-full">
          {restaurantDetails?.image && (
            <Image
              src={urlFor(restaurantDetails?.image).url()}
              alt={restaurantDetails?.name || "restaurant image"}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4 max-w-3xl">
                <div className="flex items-center gap-3">
                  {isOpen ? (
                    <Badge className="h-[unset] px-3 py-1 text-sm">
                      Open now
                    </Badge>
                  ) : (
                    <Badge
                      variant={"destructive"}
                      className="h-[unset] bg-destructive text-muted px-3 py-1 text-sm"
                    >
                      Closed now
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground shadow-sm">
                  {restaurantDetails?.name}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-foreground/90 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-5 h-5" />
                    <span>{restaurantDetails?.estimatedDeliveryTime} mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-5 h-5" />
                    <span>Min. ${restaurantDetails?.minimumOrder}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
              <div className="bg-card rounded-xl p-6 border shadow-sm">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" /> About
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {restaurantDetails.description}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold tracking-tight">Menu</h2>
                  <span className="text-muted-foreground">
                    {restaurantDetails.foodItemsCount} items available
                  </span>
                </div>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="inline-flex items-center rounded-md text-muted-foreground mb-8 w-full justify-start h-[unset] p-1 bg-transparent gap-2 no-scrollbar">
                    <TabsTrigger value="all" asChild>
                      <Button
                        className="flex-[unset] px-6 py-2.5 h-[unset] bg-primary! text-muted! rounded-full! cursor-pointer"
                        variant={"default"}
                      >
                        All Items
                      </Button>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {restaurantDetails?.foodItems.map((food, index) => (
                        <div
                          key={food._id}
                          className="animate-in fade-in zoom-in-95 fill-mode-both duration-500 ease-out"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <FoodCards food={food} key={food._id} />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            <div className="lg:col-span-4 relative">
              <div className="sticky top-24 space-y-6">
                {/* Restaurant Info */}
                <Card>
                  <div className="h-2 bg-primary w-full"></div>
                  <CardHeader>
                    <CardTitle className="leading-none font-semibold">
                      Restaurant Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <span className="block text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                          Time
                        </span>
                        <span className="font-bold text-lg">
                          {restaurantDetails.estimatedDeliveryTime} min
                        </span>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <span className="block text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                          Fee
                        </span>
                        <span className="font-bold text-lg">
                          ${(10 / 100) * restaurantDetails.minimumOrder}
                        </span>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-[1rem]">Address</p>
                          <p className="text-sm text-muted-foreground">
                            {restaurantDetails?.location.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <p className="font-medium text-[1rem]">Phone</p>
                          <a
                            href={`tel:${restaurantDetails.phone}`}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            {restaurantDetails.phone}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-primary shrink-0" />
                        <div>
                          <p className="font-medium text-[1rem]">Email</p>
                          <a
                            href={`mailto:${restaurantDetails.email}`}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            {restaurantDetails.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Opening Hours */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-semibold text-base">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      Opening Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6">
                    <div className="space-y-3">
                      {restaurantDetails?.openingHours?.schedule?.map(
                        (schedule) => (
                          <OpeningSchedule
                            key={schedule.day}
                            schedule={schedule}
                          />
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
                {/* verify */}
                <Card className="bg-green-50/50 border-green-100 shadow-none">
                  <CardContent className="p-4 flex items-center justify-center gap-4 text-green-700 text-sm font-medium">
                    <span className="flex items-center gap-1.5">
                      <CircleCheck className="w-4 h-4" /> Verified Partner
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CircleCheck className="w-4 h-4" /> Safe Food
                    </span>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteTransition>
  );
}

export default RestaurantDetailsPage;
