import { Breadcrumb } from "@/components/common/breadcrumb";
import { getCategoryBySlug } from "@/lib/sanityFunctions";
import CategoryDetailsHero from "./_components/categoryDetailsHero";
import CategoryFoodItems from "./_components/categoryFoodItems";
import CategoryFoodPageSkeleton from "./loading";
import { Metadata } from "next";
import { getImageUrl } from "@/lib/utils";
import { ImageAsset } from "sanity";
import { notFound } from "next/navigation";

interface CategoryFoodPageProps {
  params: Promise<{ slug: string }>;
}

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({
  params,
}: CategoryFoodPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryDetails = await getCategoryBySlug(slug);
  if (!categoryDetails) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found.",
    };
  }
  return {
    title: `${categoryDetails.name}`,
    description:
      categoryDetails.description ||
      `Browse our delicious ${categoryDetails.name} menu.`,
    openGraph: {
      title: `${categoryDetails.name}`,
      description:
        categoryDetails.description ||
        `Browse our delicious ${categoryDetails.name} menu.`,
      images: categoryDetails.image
        ? [
            {
              url: getImageUrl(categoryDetails.image),
            },
          ]
        : [],
    },
  };
}

const CategoryFoodPage = async ({ params }: CategoryFoodPageProps) => {
  const { slug } = await params;
  const categoryDetails = await getCategoryBySlug(slug);

  if (!categoryDetails) {
    return notFound();
  }
  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb
        items={[
          { label: "Categories", href: "/categories" },
          {
            label: categoryDetails?.name || "Category Details",
            href: `/category/${slug}`,
          },
        ]}
      />
      <CategoryDetailsHero categoryDetails={categoryDetails} />
      <CategoryFoodItems category={categoryDetails} />
    </div>
  );
};

export default CategoryFoodPage;
