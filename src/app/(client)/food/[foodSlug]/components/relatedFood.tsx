import { getFoodByCategory, getFoodBySlug } from "@/lib/data/food";

interface RelatedFoodProps {
  foodSlug: string;
}

const RelatedFood = async ({ foodSlug }: RelatedFoodProps) => {
  const foodDetails = await getFoodBySlug(foodSlug);
  const foodByCategory = await getFoodByCategory(
    foodDetails?.category?._id as string,
    foodDetails._id,
  );
  console.log(foodByCategory);
  return (
    <div>
      {foodByCategory.map((food) => (
        <div key={food._id}>{food.name}</div>
      ))}
    </div>
  );
};

export default RelatedFood;
