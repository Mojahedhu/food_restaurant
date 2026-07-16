import { getRestaurantBySlug } from "@/lib/data/restaurants";
import { isRestaurantOpen } from "@/lib/utils/schedule";
import { RouteTransition } from "@/components/common/route-transition";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import RestaurantDetailHero from "./_components/restaurantDetailHero";
import RestaurantMenuTabs from "./_components/restaurantMenuTabs";
import RestaurantInfoSidebar from "./_components/restaurantInfoSidebar";

interface RestaurantDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: RestaurantDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) {
    return { title: "Restaurant Not Found" };
  }
  return {
    title: `${restaurant.name} Delivery`,
    description: restaurant.description,
    openGraph: {
      title: `${restaurant.name} Delivery`,
      description: restaurant.description,
      images: restaurant.image
        ? [{ url: restaurant.image.asset?.url || "" }]
        : [],
    },
  };
}

async function RestaurantDetailsPage({ params }: RestaurantDetailsPageProps) {
  const { slug } = await params;
  const restaurantDetails = await getRestaurantBySlug(slug);

  if (!restaurantDetails?.foodItems) {
    notFound();
  }

  // Safe server-side computation prevents hydration crash
  const isOpen = isRestaurantOpen(restaurantDetails);

  return (
    <RouteTransition>
      <div className="min-h-screen bg-muted/10 pb-20">
        <RestaurantDetailHero restaurant={restaurantDetails} isOpen={isOpen} />
        <div className="container mx-auto px-4 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
              <RestaurantMenuTabs restaurant={restaurantDetails} />
            </div>
            <div className="lg:col-span-4 relative">
              <RestaurantInfoSidebar restaurant={restaurantDetails} />
            </div>
          </div>
        </div>
      </div>
    </RouteTransition>
  );
}

export default RestaurantDetailsPage;
