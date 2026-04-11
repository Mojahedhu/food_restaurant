import { getFeaturedFoods } from "@/lib/sanityFunctions";
import Link from "next/link";
import FoodCards from "../foods/foodCards";
import { FoodWithDetails } from "../../../types/sanityTypes";

const FeaturedFoods = async () => {
  const foods = (await getFeaturedFoods()) as unknown as FoodWithDetails[];
  return (
    <div className="mb-10">
      {/* Section Header */}
      <div className="mb-16 text-center text-w-2xl mx-auto">
        <span className="text-primary font-bold tracking-widest tex-sm uppercase">
          Delicious Menu
        </span>
        <h2 className="mt-3 text-4xl font-extrabold text-foreground tracking-tight md:text-5xl">
          Choose Your Favorite
        </h2>
        <p className="mt-4 text-muted-foreground text-lg">
          Select from a wide range of dishes prepared with fresh ingredients.
        </p>
      </div>
      {/* Food Grid */}
      <div className=" grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {foods?.map((food) => (
          <FoodCards key={food._id} food={food as FoodWithDetails} />
        ))}
      </div>
      {/* View All Button  */}
      <div className="mt-16 text-center">
        <Link
          href="/menu"
          className="inline-block text-primary rounded-full border-2 border-primary px-10 py-3 text-sm font-bold hover:border-primary transition-all uppercase tracking-wide relative overflow-hidden group/button"
        >
          <span className="absolute inset-0 bg-primary -translate-x-full group-hover/button:translate-x-0 transition-transform duration-700 ease-out"></span>
          <span className="relative z-10 transition-colors duration-700 group-hover/button:text-background">
            View Full Menu
          </span>
        </Link>
      </div>
    </div>
  );
};

export default FeaturedFoods;
