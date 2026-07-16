import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Star, Utensils } from "lucide-react";
import { Restaurant } from "@/../types/sanityTypes";

interface RestaurantDetailHeroProps {
  restaurant: Restaurant;
  isOpen: boolean;
}

export default function RestaurantDetailHero({
  restaurant,
  isOpen,
}: RestaurantDetailHeroProps) {
  return (
    <div className="relative h-[400px] w-full">
      {restaurant.image ? (
        <Image
          src={urlFor(restaurant.image).url()}
          alt={restaurant.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="w-full h-full bg-muted/50 flex items-center justify-center text-muted-foreground">
          <Utensils className="text-primary w-24 h-24" />
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent pointer-events-none"></div>

      <div className="absolute bottom-0 left-0 w-full container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              {isOpen ? (
                <Badge className="h-[unset] px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white border-transparent shadow-sm">
                  Open now
                </Badge>
              ) : (
                <Badge
                  variant="destructive"
                  className="h-[unset] px-3 py-1 text-sm shadow-sm"
                >
                  Closed now
                </Badge>
              )}
              {(restaurant.rating || 0) > 0 && (
                <Badge
                  variant="secondary"
                  className="h-[unset] px-3 py-1 text-sm flex items-center gap-1 shadow-sm border-transparent bg-background/80 backdrop-blur-sm"
                >
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" />
                  <span className="font-bold">
                    {(restaurant.rating || 0).toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({restaurant.totalReviews || 0})
                  </span>
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground shadow-sm">
              {restaurant.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-foreground/90 font-medium">
              <div className="flex items-center gap-1.5 bg-background/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/50">
                <Clock className="w-5 h-5 text-primary" />
                <span>{restaurant.estimatedDeliveryTime} mins delivery</span>
              </div>
              <div className="flex items-center gap-1.5 bg-background/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/50">
                <DollarSign className="w-5 h-5 text-primary" />
                <span>Min. ${restaurant.minimumOrder}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
