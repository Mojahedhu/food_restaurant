import { Breadcrumb } from "@/components/common/breadcrumb";
import CategoriesFooter from "./_components/categoriesFooter";
import { Suspense } from "react";
import CategoriesContent from "./_components/categoriesContent";
import CategoriesSkeleton from "./_components/categoriesSkeleton";

export const metadata = {
  title: "Categories",
  description: "Browse our delicious food categories.",
};

function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Breadcrumb items={[{ label: "Categories", href: "/categories" }]} />
      <main className="flex-1">
        {/* Suspense boundary activates the Skeleton while fetching categories */}
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoriesContent />
        </Suspense>
      </main>
      <CategoriesFooter />
    </div>
  );
}

export default CategoriesPage;
