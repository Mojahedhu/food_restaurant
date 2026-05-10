import { Suspense } from "react";
import FoodDetails from "./components/foodDetails";
import RelatedFood from "./components/relatedFood";
import {
  FoodDetailsSkeleton,
  RelatedFoodSkeleton,
} from "./components/skeleton";
import { getReviewsByFoodId } from "@/lib/data/review";
import FoodReview from "./components/foodReview";
import FoodReviewSkeleton from "./components/foodReviewSkeleton";
import auth from "../../../../../auth";
import { getFoodBySlug } from "@/lib/data/food";
import { Metadata } from "next";

import { urlFor } from "@/sanity/lib/image";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import loading from "./loading";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ foodSlug: string }>;
}): Promise<Metadata> {
  const { foodSlug: slug } = await params;
  const food = await getFoodBySlug(slug);
  return {
    title: "Quick Food |" + " " + food?.name,
    description: food?.description,
    openGraph: {
      title: "Quick Food |" + " " + food?.name,
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
  const session = await auth();
  const userId = session?.user?.id;
  console.log(userId);
  console.log("foodSlugId", foodSlug);
  // const initialReviews = await getReviewsByFoodId(foodSlug, userId as string);

  // Fetch only what's needed to unlock the rest

  // return (
  //   <div className="min-h-screen bg-background">
  //     {/* First boundary */}
  //     <Suspense fallback={<FoodDetailsSkeleton />}>
  //       <FoodDetails foodSlug={foodSlug} />
  //     </Suspense>

  //     <Suspense fallback={<FoodReviewSkeleton />}>
  //       <FoodReview
  //         foodId={foodSlug}
  //         initialReviews={initialReviews}
  //         userId={userId as string}
  //       />
  //     </Suspense>

  //     {/* Secondary boundary */}
  //     <Suspense fallback={<RelatedFoodSkeleton />}>
  //       <RelatedFood foodSlug={foodSlug} />
  //     </Suspense>
  //   </div>
  // );
  return loading();
};

export default FoodPage;
