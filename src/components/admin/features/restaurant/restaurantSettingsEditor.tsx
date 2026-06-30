"use client";

import { RestaurantDetails } from "@/types/admin";
import { useRestaurantLogic } from "@/hooks/useRestaurantLogic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DeliveryPricingTab } from "./deliveryPricingTab";
import { LocationTab } from "./locationTab";
import { OpeningHoursTab } from "./openingHoursTab";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Landmark, Truck, Map, CalendarRange } from "lucide-react";
import Link from "next/link";
import { GeneralInfoTab } from "./generalInfoTab";
import { useState } from "react";
import { ScheduleSummary } from "@/types/admin";

interface RestaurantSettingsEditorProps {
  restaurant: RestaurantDetails;
  allSchedules?: ScheduleSummary[];
}

export function RestaurantSettingsEditor({
  restaurant,
  allSchedules,
}: RestaurantSettingsEditorProps) {
  const [activeTab, setActiveTab] = useState("general");

  // React key forces hook state re-initiation if a new reference is linked
  const formLogic = useRestaurantLogic(restaurant);

  // Form submit handler that routes based on the active tab
  const handleFormSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (activeTab === "schedule") {
      formLogic.handleSaveSchedule();
    } else {
      // Cast the FormEvent to match hook signature
      formLogic.handleSaveDetails(
        e as unknown as React.SubmitEvent<HTMLFormElement>,
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div className="flex items-center">
        <Button asChild variant="ghost" size="sm" className="group gap-1">
          <Link href="/admin/settings">
            <ArrowLeft className="size-4 transition-transform duration-300 ease-in-out group-hover:-translate-x-1" />{" "}
            Back to all restaurants
          </Link>
        </Button>
      </div>

      {/* Editor Layout Tabs */}
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-muted/50 p-1 border rounded-lg h-auto gap-1">
            <TabsTrigger
              value="general"
              className="py-2.5 flex items-center justify-center gap-1.5 font-medium"
            >
              <Landmark className="size-4" /> Profile Info
            </TabsTrigger>
            <TabsTrigger
              value="delivery"
              className="py-2.5 flex items-center justify-center gap-1.5 font-medium"
            >
              <Truck className="size-4" /> Delivery rules
            </TabsTrigger>
            <TabsTrigger
              value="location"
              className="py-2.5 flex items-center justify-center gap-1.5 font-medium"
            >
              <Map className="size-4" /> Address & Location
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="py-2.5 flex items-center justify-center gap-1.5 font-medium"
            >
              <CalendarRange className="size-4" /> Operating Hours
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="focus-visible:outline-none">
            <GeneralInfoTab formLogic={formLogic} logoUrl={restaurant.image} />
          </TabsContent>

          <TabsContent value="delivery" className="focus-visible:outline-none">
            <DeliveryPricingTab formLogic={formLogic} />
          </TabsContent>

          <TabsContent value="location" className="focus-visible:outline-none">
            <LocationTab formLogic={formLogic} />
          </TabsContent>

          {/* Operating hours schedule manages its own save action separately */}
          <TabsContent value="schedule" className="focus-visible:outline-none">
            <OpeningHoursTab
              formLogic={formLogic}
              openingHoursId={restaurant.openingHours?._id}
              allSchedules={allSchedules}
            />
          </TabsContent>
        </Tabs>

        {/* Unified Action Footer (visible on all tabs, including schedule) */}
        <div className="flex justify-end gap-3 border border-border rounded-lg p-2 shadow-md pt-6 mt-6">
          <Button
            asChild
            variant="ghost"
            className="hover:cursor-pointer shadow-md"
          >
            <Link href="/admin/settings">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={formLogic.isPending}
            className="min-w-32 hover:cursor-pointer"
          >
            {formLogic.isPending ? (
              <div className="size-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
