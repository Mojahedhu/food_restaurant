import { Breadcrumb } from "@/components/common/breadcrumb";
import CategoriesHero from "./_components/categoriesHero";
import CategoriesGrid from "./_components/categoriesGrid";
import { getCategories } from "@/lib/sanityFunctions";
import CategoriesFooter from "./_components/categoriesFooter";
import { Suspense } from "react";

async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
        ]}
      />
      <CategoriesHero itemCount={categories.length} />
      <Suspense
        fallback={
          <div className="h-screen flex justify-center">
            <div className="mt-12">Loading categories...</div>
          </div>
        }
      >
        <CategoriesGrid categories={categories} />
      </Suspense>
      <CategoriesFooter />
    </div>
  );
}

export default CategoriesPage;
