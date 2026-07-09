import { Suspense } from "react";
import FoodDetails from "./_components/layout/food-details";
import RelatedFood from "./_components/related/related-foods";
import { ReviewSkeleton } from "./_components/skeletons/reviews-skeleton";
import { getFoodBySlug } from "@/lib/data/food";
import { Metadata } from "next";
import { urlFor } from "@/sanity/lib/image";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { SanityImageSource } from "@sanity/image-url";
import { Separator } from "@/components/ui/separator";
import ReviewSection from "./_components/reviews/review-section";
import { FoodDetailsSkeleton } from "./_components/skeletons/food-details-skeleton";
import { RelatedFoodSkeleton } from "./_components/skeletons/related-foods-skeleton";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { foodSlug: string };
}): Promise<Metadata> {
  const { foodSlug } = await params;
  const food = await getFoodBySlug(foodSlug); // Cached automatically!

  if (!food) {
    return notFound();
  }
  return {
    title: `${food.name} | Your App`,
    description: food.description,
    openGraph: {
      title: food.name,
      images: [
        {
          url: urlFor(food?.images?.[0] as SanityImageSource).url(),
          width: 800,
          height: 600,
        },
      ],
    },
  };
}

interface FoodPageProps {
  params: Promise<{ foodSlug: string }>;
}

const FoodPage = async ({ params }: FoodPageProps) => {
  const { foodSlug } = await params;

  /**
   * ==========================================
   * Food lookup
   * ==========================================
   */

  const foodDetails = await getFoodBySlug(foodSlug);

  if (!foodDetails) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb
        items={[
          { label: "Menu", href: `/menu` },
          {
            label: foodDetails?.category?.name as string,
            href: `/category/${foodDetails?.category?.slug}`,
          },
          {
            label: foodDetails?.name as string,
            href: `/food/${foodDetails?.slug}`,
          },
        ]}
      />
      {/* First boundary */}
      <main className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Suspense fallback={<FoodDetailsSkeleton />}>
            <FoodDetails foodSlug={foodSlug} />
          </Suspense>
          <Separator className="mb-12" />

          <Suspense fallback={<ReviewSkeleton />}>
            <ReviewSection
              foodId={foodDetails._id}
              foodName={foodDetails.name}
            />
          </Suspense>

          <Separator className="mb-12" />
          <Separator className="mb-12" />

          {/* Secondary boundary */}
          <Suspense fallback={<RelatedFoodSkeleton />}>
            <RelatedFood foodSlug={foodSlug} />
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default FoodPage;
