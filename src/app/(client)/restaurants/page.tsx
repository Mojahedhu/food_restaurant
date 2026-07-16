import { Breadcrumb } from "@/components/common/breadcrumb";
import { getRestaurants } from "@/lib/data/restaurants";
import { Utensils } from "lucide-react";

import { Restaurant } from "@/../types/sanityTypes";
import { Metadata } from "next";
import RestaurantsClient from "./restaurantsClient";

export const metadata: Metadata = {
  title: "Restaurants",
  description: "Discover delicious food from our partner restaurants",
};

async function RestaurantPage() {
  const restaurants: Restaurant[] = await getRestaurants();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4">
        <Breadcrumb
          className="mb-8"
          items={[{ label: "Restaurants", href: "/restaurants" }]}
        />
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Utensils className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold">Restaurants</h1>
          </div>
          <p className="text-muted-foreground">
            Discover delicious food from our partner restaurants
          </p>
        </div>
      </div>

      <main className="flex-1 pb-16">
        {!restaurants || restaurants.length === 0 ? (
          <div className="container mx-auto px-4 py-32 text-center animate-in fade-in duration-500">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/50">
              <Utensils className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              No restaurants found
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              We are currently updating our partner list. Please check back
              shortly.
            </p>
          </div>
        ) : (
          <RestaurantsClient initialRestaurants={restaurants} />
        )}
      </main>
    </div>
  );
}

export default RestaurantPage;
