import { client } from "@/sanity/lib/client";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "../ui/card";
import { Restaurant } from "../../../sanity.types";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { Badge } from "../ui/badge";
import { Clock, MapPin, Star, Utensils } from "lucide-react";
const query = `*[ _type == "restaurant" && isFeatured == true ] {
_id,
name,
description,
image,
rating,
deliveryFee,
estimatedDeliveryTime,
"slug": slug.current,
location,
isActive,
minimumOrder,
totalReviews,
"categoriesCount": count(categories),
"foodItemsCount": count(foodItems)
}`;

const FeaturedRestaurants = async () => {
  const restaurants: Restaurant[] = await client.fetch(query);

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
          <Link key={restaurant._id} href={`/restaurant/${restaurant.slug}`}>
            <Card className="py-0 overflow-hidden hover:shadow-lg hover-effect">
              <div className="relative h-48 w-full overflow-hidden rounded-lg">
                {restaurant.image && (
                  <Image
                    src={urlFor(restaurant.image).url()}
                    alt={"Restaurant Image"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                )}
                {!restaurant.isActive && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge variant={"destructive"} className="text-lg">
                      Currently Closed
                    </Badge>
                  </div>
                )}
                {restaurant.isActive && (
                  <Badge className="absolute top-2 right-2 bg-green-500">
                    Open Now
                  </Badge>
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <CardTitle>
                    <h3>{restaurant.name}</h3>
                  </CardTitle>
                  {!!restaurant.rating && restaurant.rating > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4" aria-label="rating" />
                      <span className="text-yellow-400">
                        {restaurant.rating.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        ({restaurant.totalReviews})
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {restaurant.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">
                    {restaurant.location?.address}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{restaurant.estimatedDeliveryTime} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Utensils className="w-4 h-4" />
                  <span className="text-muted-foreground">
                    {restaurant.foodItemsCount} items •{" "}
                    {restaurant.categoriesCount} categories
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedRestaurants;
