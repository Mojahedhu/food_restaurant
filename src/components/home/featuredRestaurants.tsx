import { Restaurant } from "../../../sanity.types";

import RestaurantCard from "../restaurants/restaurantCard";

import { getFeaturedRestaurants } from "@/lib/data/restaurants";

const FeaturedRestaurants = async () => {
  const restaurants: Restaurant[] = await getFeaturedRestaurants();

  if (!restaurants || restaurants.length === 0) {
    return null;
  }

  return (
    <section className="py-10 lg:py-16 bg-muted/30 p-5">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Featured Restaurants
          </h2>
          <p className="text-muted-foreground mt-2">
            Hand-picked restaurants for you
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {restaurants.map((restaurant: Restaurant) => (
          <RestaurantCard restaurant={restaurant} key={restaurant._id} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedRestaurants;
