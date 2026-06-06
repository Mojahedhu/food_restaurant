import { getFoodBySlug } from "@/lib/data/food";
import { Check } from "lucide-react";
import FoodGallery from "./foodGallery";

interface FoodDetailsProps {
  foodSlug: string;
}

const FoodDetails = async ({ foodSlug }: FoodDetailsProps) => {
  const foodDetails = await getFoodBySlug(foodSlug);

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <FoodGallery foodDetails={foodDetails} />
      </div>
      <div className="mt-12 lg:mt-16 mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Ingredients</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {foodDetails.ingredients?.map((ingredient) => (
            <div
              key={ingredient._id}
              className="flex items-start gap-3 p-4 rounded-lg bg-muted"
            >
              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-foreground">
                  {ingredient.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FoodDetails;
