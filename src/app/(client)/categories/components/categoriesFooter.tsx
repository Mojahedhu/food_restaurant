import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

function CategoriesFooter() {
  return (
    <div className="relative border-t bg-linear-to-br from-secondary/20 to-background overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
      <div className="container mx-auto px-4 py-20 text-center relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h2 className="mb-4 text-3xl font-bold">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Check out our full menu with all available items and special offers
          </p>
          <Link
            href={"/menu"}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:gap-3 shadow-lg hover:shadow-xl group"
          >
            <span>View Full Menu</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CategoriesFooter;
