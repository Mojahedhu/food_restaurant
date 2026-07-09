import { Breadcrumb } from "@/components/common/breadcrumb";
import { getRestaurants } from "@/lib/data/restaurants";
import { Utensils } from "lucide-react";

import RestaurantCard from "@/components/restaurants/restaurantCard";
import { Restaurant } from "../../../../types/sanityTypes";

async function RestaurantPage() {
  const restaurants: Restaurant[] = await getRestaurants();

  return (
    <div className="container mx-auto px-4 pb-8">
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
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {restaurants.length} restaurants available
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {restaurants.map((restaurant: Restaurant, index: number) => (
          <div
            key={restaurant._id}
            className="animate-in fade-in zoom-in-95 fill-mode-both duration-500 ease-out"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <RestaurantCard restaurant={restaurant} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default RestaurantPage;
