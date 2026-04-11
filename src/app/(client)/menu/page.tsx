import { client } from "@/sanity/lib/client";
import React, { Suspense } from "react";
import { FoodWithDetails } from "../../../../types/sanityTypes";
import { Breadcrumb } from "@/components/common/breadcrumb";
import MenuClient from "./menu-client";

export const metadata = {
  title: "Menu - QuickFood",
  description: "Browse our delicious menu and order you favorite dishes",
};

async function getMenuData() {
  const foods = await client.fetch<FoodWithDetails[]>(
    `*[_type == "food" && available == true] 
    | order(_createdAt desc) 
    [0...12] {
          _id,
          _createdAt,
          name,
          "slug": slug.current,
          description,
          "basePrice": price,
          images,
          preparationTime,
          spiceLevel,
          available,
          featured,
          averageRating,
          totalReviews,
          category->{
            _id,
            name,
            "slug": slug.current,
            description
          },
          varieties[]->{
            _id,
            name,
          }
        }`,
  );
  const count = await client.fetch(
    `count(*[_type == "food" && available == true])`,
  );

  return { foods, count };
}
const MenuPage = async () => {
  const { foods, count } = await getMenuData();
  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: "Menu" }]} />
      <Suspense fallback={<div>Loading...</div>}>
        <MenuClient initialFoods={foods} totalCount={count} />
      </Suspense>
    </div>
  );
};

export default MenuPage;
