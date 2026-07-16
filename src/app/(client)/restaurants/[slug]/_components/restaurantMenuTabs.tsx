"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import FoodCards from "@/components/foods/foodCards";
import { Restaurant } from "@/../types/sanityTypes";
import { Info, UtensilsCrossed } from "lucide-react";

interface RestaurantMenuTabsProps {
  restaurant: Restaurant;
}

export default function RestaurantMenuTabs({
  restaurant,
}: RestaurantMenuTabsProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const foods = restaurant.foodItems || [];

  // Dynamically extract and uniquely list categories inside this restaurant's menu
  const categories = useMemo(() => {
    const cats = new Set<string>();
    foods.forEach((food) => {
      if (food.category?.name) {
        cats.add(food.category.name);
      }
    });
    return ["All", ...Array.from(cats)];
  }, [foods]);

  const [activeTab, setActiveTab] = useState("All");

  const filteredFoods =
    activeTab === "All"
      ? foods
      : foods.filter((f) => f.category?.name === activeTab);

  if (foods.length === 0) {
    return (
      <div className="bg-card rounded-xl p-12 border shadow-sm text-center animate-in zoom-in-95 duration-300">
        <UtensilsCrossed className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No menu items available</h3>
        <p className="text-muted-foreground">
          This restaurant is currently updating its menu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="bg-card rounded-xl p-6 border shadow-sm animate-in fade-in duration-500">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" /> About
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {restaurant.description}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Menu</h2>
          <span className="text-muted-foreground font-medium">
            {restaurant.foodItemsCount || foods.length} items available
          </span>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-4 mb-4 no-scrollbar">
            <TabsList className="flex flex-wrap h-auto! items-center rounded-md bg-transparent gap-2 p-0">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat} asChild>
                  <Button
                    variant={activeTab === cat ? "default" : "outline"}
                    className={`rounded-full px-6 transition-all w-fit! ${
                      activeTab === cat
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-card hover:bg-muted"
                    }`}
                  >
                    {cat}
                  </Button>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFoods.map((food, index) => (
              <div
                key={food._id}
                className="animate-in fade-in zoom-in-95 fill-mode-both duration-500 ease-out"
                style={{ animationDelay: `${(index % 10) * 50}ms` }}
              >
                <FoodCards food={food} />
              </div>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
