import { Metadata } from "next";
import {
  fetchAdminRestaurants,
  fetchAllSchedules,
  fetchRestaurantDetails,
} from "@/actions/admin-restaurant";
import { RestaurantList } from "@/components/admin/features/restaurant/restaurantList";
import { RestaurantSettingsEditor } from "@/components/admin/features/restaurant/restaurantSettingsEditor";
import { Separator } from "@/components/ui/separator";
import { RestaurantFilter } from "@/components/admin/features/restaurant/restaurantFilter";
import { PaginationControls } from "@/components/admin/features/orders/paginationControls";

export const metadata: Metadata = {
  title: "Restaurant Info & Settings Center | Quick Food Admin",
  description:
    "Configure restaurant profiles, weekly schedules, location metrics, and delivery settings.",
};

interface SettingsPageProps {
  searchParams: Promise<{
    id?: string;
    search?: string;
    status?: string;
    featured?: string;
    page?: string;
  }>;
}

export default async function SettingsCenterPage({
  searchParams,
}: SettingsPageProps) {
  const resolvedParams = await searchParams;
  const restaurantId = resolvedParams.id;

  if (!restaurantId) {
    // 1. Parse filter and paging search params
    const currentPage = Number(resolvedParams.page || "1");
    const search = resolvedParams.search || "";
    const status = resolvedParams.status || "all";
    const featured = resolvedParams.featured || "all";
    const pageSize = 5; // Set page size to 5 for clear testable pagination

    // 2. Fetch page and count on Sanity
    const { restaurants, totalItems } = await fetchAdminRestaurants({
      page: currentPage,
      pageSize,
      search,
      status,
      featured,
    });

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Restaurant Settings Center
          </h1>
          <p className="text-muted-foreground text-sm">
            Toggle accepting orders, update delivery fees, and configure active
            schedules for partner locations.
          </p>
        </div>

        <Separator />

        {/* Dynamic Filters */}
        <RestaurantFilter />

        {/* Data Table */}
        <RestaurantList initialRestaurants={restaurants} />

        {/* Reusable Pagination */}
        <PaginationControls
          totalItems={totalItems}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      </div>
    );
  }

  // Edit view of a single restaurant
  const restaurant = await fetchRestaurantDetails(restaurantId);

  if (!restaurant) {
    return (
      <div className="p-10 border border-dashed rounded-xl text-center text-muted-foreground space-y-3">
        <p className="text-base font-medium">
          Restaurant details not found in Sanity CMS.
        </p>
        <a
          href="/admin/settings"
          className="inline-block text-primary underline text-sm hover:text-primary/80 font-semibold"
        >
          Return to All Restaurants
        </a>
      </div>
    );
  }

  const allSchedules = await fetchAllSchedules();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Restaurant Profile
        </h1>
        <p className="text-muted-foreground text-sm">
          Update branding, delivery configurations, and operational schedules
          for{" "}
          <span className="font-semibold text-foreground">
            {restaurant.name}
          </span>
          .
        </p>
      </div>

      <Separator />

      <RestaurantSettingsEditor
        restaurant={restaurant}
        allSchedules={allSchedules}
      />
    </div>
  );
}
