import { Breadcrumb } from "@/components/common/breadcrumb";
import CategoriesHero from "./components/categoriesHero";
import CategoriesGrid from "./components/categoriesGrid";
import { getCategories } from "@/lib/sanityFunctions";
import CategoriesFooter from "./components/categoriesFooter";

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
      <CategoriesGrid categories={categories} />
      <CategoriesFooter />
    </div>
  );
}

export default CategoriesPage;
