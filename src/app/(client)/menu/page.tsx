import { Suspense } from "react";
import { Breadcrumb } from "@/components/common/breadcrumb";
import MenuClient from "./menu-client";
import { getMenuFoods, getMenuTotalCount, SortOption } from "@/lib/data/menu";

export const metadata = {
  title: "Menu - QuickFood",
  description: "Browse our delicious menu and order you favorite dishes",
};

interface MenuPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MenuPage(props: MenuPageProps) {
  // Await searchParams to satisfy Next.js asynchronous requirements
  const searchParams = await props.searchParams;

  // Rule 7: URL-Driven UI State
  const sortParam = (searchParams?.sort as string) || "latest";

  const validSorts: SortOption[] = [
    "latest",
    "name-asc",
    "name-desc",
    "price-low",
    "price-high",
  ];
  const sortBy: SortOption = validSorts.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : "latest";

  const [foods, count] = await Promise.all([
    getMenuFoods(0, sortBy),
    getMenuTotalCount(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: "Menu" }]} />
      <Suspense
        fallback={
          <div className="h-screen flex justify-center">
            <div className="mt-12 text-muted-foreground animate-pulse">
              Loading menu...
            </div>
          </div>
        }
      >
        <MenuClient
          initialFoods={foods}
          totalCount={count}
          initialSort={sortBy}
        />
      </Suspense>
    </div>
  );
}
