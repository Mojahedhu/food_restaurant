import { Breadcrumb } from "@/components/common/breadcrumb";
import CategoriesHero from "./components/categoriesHero";
import CategoriesGrid from "./components/categoriesGrid";
import { getCategories } from "@/lib/sanityFunctions";
import CategoriesFooter from "./components/categoriesFooter";
import { Suspense } from "react";

async function CategoriesPage() {
  const categories = await getCategories();

  console.log("categories", categories);
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
