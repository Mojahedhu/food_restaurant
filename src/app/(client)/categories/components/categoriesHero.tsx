import { Sparkles, UtensilsCrossed } from "lucide-react";

interface CategoriesHeroProps {
  itemCount: number;
}

function CategoriesHero({ itemCount }: CategoriesHeroProps) {
  return (
    <div className="relative border-b bg-linear-to-br from-primary/5 via-background to-primary/5 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="container mx-auto px-4 py-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary uppercase tracking-wide">
            Browse Our Menu
          </span>
        </div>
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Food Categories
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground leading-relaxed">
          Explore our diverse range of cuisines and find your favorite dishes
          from around the world
        </p>
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <UtensilsCrossed className="h-4 w-4 text-primary" />
          <span>{itemCount} Categories Available</span>
        </div>
      </div>
    </div>
  );
}

export default CategoriesHero;
