import { Suspense } from "react";
import FoodDetails from "./components/foodDetails";
import RelatedFood from "./components/relatedFood";
import {
  FoodDetailsSkeleton,
  RelatedFoodSkeleton,
} from "./components/skeleton";
import {
  getMyReviewReactions,
  getReviewMetrics,
  getReviewsByFoodId,
  mergeReviewFeed,
} from "@/lib/data/review";

import FoodReviewSkeleton from "./components/foodReviewSkeleton";
import auth from "../../../../../auth";
import { getFoodBySlug } from "@/lib/data/food";
import { Metadata } from "next";

import { urlFor } from "@/sanity/lib/image";

import { Breadcrumb } from "@/components/common/breadcrumb";
import { SanityImageSource } from "@sanity/image-url";
import { Separator } from "@/components/ui/separator";
import ReviewClientProvider from "./components/reviewClientProvider";
import ReviewSection from "./components/reviewSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ foodSlug: string }>;
}): Promise<Metadata> {
  const { foodSlug: slug } = await params;
  const food = await getFoodBySlug(slug);
  return {
    title: food?.name,
    description: food?.description,
    openGraph: {
      title: food?.name,
      description: food?.description,
      images: [
        {
          url:
            urlFor(food?.images?.[0]?.asset as SanityImageSource)?.url() || "",
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
   * Session
   * ==========================================
   */

  const session = await auth();
  const userId = session?.user?.id;

  /**
   * ==========================================
   * Food lookup
   * ==========================================
   */

  const foodDetails = await getFoodBySlug(foodSlug);

  /**
   * ==========================================
   * Review projection bootstrap
   * ==========================================
   */

  const reviews = await getReviewsByFoodId(foodDetails._id, userId);

  const metrics = await getReviewMetrics(foodDetails._id);

  const reactions = await getMyReviewReactions(foodDetails._id);

  const initialReviewsFeed = mergeReviewFeed({ reviews, metrics, reactions });

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

          <Suspense fallback={<FoodReviewSkeleton />}>
            <ReviewClientProvider
              initialReviews={initialReviewsFeed}
              foodId={foodDetails._id}
              userId={userId ?? ""}
            >
              {/* <FoodReview foodId={foodDetails._id} userId={userId ?? ""} /> */}
              <ReviewSection foodId={foodDetails._id} userId={userId ?? ""} />
            </ReviewClientProvider>
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
