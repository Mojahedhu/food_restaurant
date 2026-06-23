import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";

import { ChefHat, Type } from "lucide-react";
import { CategoryWithCount } from "../../../../../../types/sanityTypes";

interface CategoryDetailsHeroProps {
  categoryDetails: CategoryWithCount;
}

function CategoryDetailsHero({ categoryDetails }: CategoryDetailsHeroProps) {
  console.log(categoryDetails);
  return (
    <div className="relative border-b bg-linear-to-br from-primary/5 via-background to-primary/5 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 p-6 shadow-lg">
            {categoryDetails?.image ? (
              <Image
                src={urlFor(categoryDetails?.image).url()}
                alt=""
                width={200}
                height={200}
                loading="lazy"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/20 rounded-2xl">
                <Type className="w-20 h-20 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {categoryDetails.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
              {categoryDetails.description}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <ChefHat className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                {categoryDetails.itemsCount} Items Available
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryDetailsHero;
