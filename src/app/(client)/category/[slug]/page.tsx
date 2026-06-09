import { Breadcrumb } from "@/components/common/breadcrumb";
import { getCategoryBySlug } from "@/lib/sanityFunctions";
import CategoryDetailsHero from "./_components/categoryDetailsHero";
import CategoryFoodItems from "./_components/categoryFoodItems";
import CategoryFoodPageSkeleton from "./loading";

interface CategoryFoodPageProps {
  params: Promise<{ slug: string }>;
}
const CategoryFoodPage = async ({ params }: CategoryFoodPageProps) => {
  const { slug } = await params;
  const categoryDetails = await getCategoryBySlug(slug);

  if (!categoryDetails) {
    return <CategoryFoodPageSkeleton />;
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
