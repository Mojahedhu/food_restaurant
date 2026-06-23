import { getCategories } from "@/lib/sanityFunctions";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

const Categories = async () => {
  const categories = await getCategories();

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="relative py-10 lg:py-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-primary/5" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      <div className="relative z-10">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wide">
              Popular Categories
            </span>
          </div>
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            What Are You Craving?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover your favorite dishes from our carefully curated categories.
          </p>
        </div>
        {/* Categories Grid */}
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((category, index: number) => (
            <Link key={category._id} href={`/category/${category?.slug}`}>
              <div
                className="group relative overflow-hidden rounded-2xl bg-card shadow-md hover:drop-shadow-2xl hover-effect hover:-translate-y-2 border border-border"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative p-6 text-center">
                  {/* Image Container with Floating Animation */}
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm group-hover:shadow-lg">
                    {category.image ? (
                      <Image
                        src={urlFor(category.image).url()}
                        alt={category?.name || "Category Image"}
                        width={250}
                        height={250}
                        className="h-14 w-14 object-contain group-hover:scale-110 transition-transform duration-300"
                        // additional props if needed
                      />
                    ) : (
                      // fallback content if no image
                      <span className="text-3xl">☢</span>
                    )}
                  </div>
                  {/* Category Name */}
                  <h3 className="mb-2 font-bold text-sm text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 h-10">
                    {category.name}
                  </h3>

                  {/* Item Count Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {category?.itemsCount || 0} items
                  </div>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </Link>
          ))}
        </div>
        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-300 hover:gap-3 shadow-lg hover:shadow-xl group"
          >
            <span>Explore All Categories</span>
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;
