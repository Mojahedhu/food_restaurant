import { Breadcrumb } from "@/components/common/breadcrumb";
import { getFoodBySlug } from "@/lib/data/food";

interface FoodDetailsProps {
  foodSlug: string;
}

const FoodDetails = async ({ foodSlug }: FoodDetailsProps) => {
  const foodDetails = await getFoodBySlug(foodSlug);
  console.log(foodDetails);
  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb
        items={[
          { label: "Menu", href: `/menu` },
          {
            label: foodDetails?.category?.name as string,
            href: `/category/${foodDetails?.category?.slug}`,
          },
          {
            label: foodDetails?.name as string,
            href: `/food/${foodDetails?.slug}`,
          },
        ]}
      />
    </div>
  );
};

export default FoodDetails;
