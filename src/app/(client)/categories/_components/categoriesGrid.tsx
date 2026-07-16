import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { ArrowRight, Utensils } from "lucide-react";
import { CategoryWithCount } from "@/../types/sanityTypes";

interface CategoriesGridProps {
  categories: CategoryWithCount[];
}

function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category, index) => (
          <Link key={category._id} href={`/category/${category?.slug}`}>
            <div
              className="group relative flex h-full overflow-hidden rounded-2xl bg-card shadow-md hover:drop-shadow-2xl hover-effect hover:-translate-y-2 border border-border animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-500 fill-mode-both"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Content */}
              <div className="relative flex flex-col items-center p-8 flex-1">
                {/* Image Container with Floating Animation */}
                <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm group-hover:shadow-lg shrink-0">
                  {category.image ? (
                    <Image
                      src={urlFor(category.image).url()}
                      alt={category?.name || "Category Image"}
                      width={128}
                      height={128}
                      className="h-20 w-20 object-contain transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      // additional props if needed
                    />
                  ) : (
                    // fallback content if no image
                    <Utensils className="h-10 w-10 text-primary/40" />
                  )}
                </div>
                {/* Category Name */}
                <h3 className="mb-4 text-center font-bold text-xl text-foreground group-hover:text-primary line-clamp-1 transition-colors duration-300">
                  {category.name}
                </h3>

                {/* Item Count Badge - Pushed to the bottom securely by mt-auto*/}
                <div className="flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm font-medium text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {category.itemsCount || 0} items
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CategoriesGrid;
