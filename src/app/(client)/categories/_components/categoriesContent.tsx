import { UtensilsCrossed } from "lucide-react";
import { getCategories } from "@/lib/sanityFunctions";
import CategoriesClient from "../categoriesClient";

async function CategoriesContent() {
  const categories = await getCategories();
  // Resilient Empty State
  if (!categories || categories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center animate-in fade-in duration-500">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          No categories found
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We are currently updating our menu categories. Please check back
          shortly for fresh options.
        </p>
      </div>
    );
  }
  // Pass down to Client Orchestrator
  return <CategoriesClient initialCategories={categories} />;
}

export default CategoriesContent;
