import { Breadcrumb } from "@/components/common/breadcrumb";
import { getCategoryBySlug } from "@/lib/sanityFunctions";
import CategoryDetailsHero from "./components/categoryDetailsHero";
import CategoryFoodItems from "./components/categoryFoodItems";

interface CategoryFoodPageProps {
  params: Promise<{ slug: string }>;
}
const CategoryFoodPage = async ({ params }: CategoryFoodPageProps) => {
  const { slug } = await params;
  const categoryDetails = await getCategoryBySlug(slug);
  const { name, description, itemsCount } = categoryDetails;
  if (!categoryDetails) {
    return null;
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
