import {
  BasketIcon,
  CubeIcon,
  DocumentTextIcon,
  FolderIcon,
  TagIcon,
  TrolleyIcon,
  UsersIcon,
} from "@sanity/icons";
import { MapIcon, UserIcon } from "lucide-react";
import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Quick Food Admin")
    .items([
      // Food Management Section
      S.listItem()
        .title("Food Management")
        .icon(TrolleyIcon)
        .child(
          S.list()
            .title("Food Management")
            .items([
              S.listItem()
                .title("All Food Items")
                .icon(TrolleyIcon)
                .schemaType("food")
                .child(
                  S.documentTypeList("food")
                    .title("All Food Items")
                    .defaultOrdering([
                      { field: "_createdAt", direction: "desc" },
                    ]),
                ),
              S.listItem()
                .title("Categories")
                .icon(FolderIcon)
                .schemaType("category")
                .child(
                  S.documentTypeList("category")
                    .title("Categories")
                    .defaultOrdering([{ field: "order", direction: "asc" }]),
                ),
              S.listItem()
                .title("Food Varieties")
                .icon(TagIcon)
                .schemaType("foodVariety")
                .child(
                  S.documentTypeList("foodVariety")
                    .title("Food Varieties")
                    .defaultOrdering([{ field: "name", direction: "asc" }]),
                ),
              S.listItem()
                .title("Ingredient")
                .icon(CubeIcon)
                .schemaType("ingredient")
                .child(
                  S.documentTypeList("ingredient")
                    .title("Ingredient")
                    .defaultOrdering([{ field: "order", direction: "asc" }]),
                ),
              S.listItem()
                .title("Sizes")
                .icon(CubeIcon)
                .schemaType("size")
                .child(
                  S.documentTypeList("size")
                    .title("Sizes")
                    .defaultOrdering([{ field: "order", direction: "asc" }]),
                ),

              S.divider(),

              S.listItem()
                .title("Featured Items")
                .icon(TrolleyIcon)
                .schemaType("food")
                .child(
                  S.documentTypeList("food")
                    .title("Featured Items")
                    .filter("_type == 'food' && Featured == true")
                    .defaultOrdering([{ field: "order", direction: "asc" }]),
                ),

              S.listItem()
                .title("Available Items")
                .icon(TrolleyIcon)
                .schemaType("food")
                .child(
                  S.documentTypeList("food")
                    .title("Available Items")
                    .filter("_type == 'food' && Featured == true")
                    .defaultOrdering([{ field: "name", direction: "asc" }]),
                ),

              S.listItem()
                .title("Unavailable Items")
                .icon(TrolleyIcon)
                .schemaType("food")
                .child(
                  S.documentTypeList("food")
                    .title("Unavailable Items")
                    .filter("_type == 'food' && Featured == false")
                    .defaultOrdering([{ field: "name", direction: "asc" }]),
                ),

              S.divider(),

              S.listItem()
                .title("Product Reviews")
                .icon(DocumentTextIcon)
                .schemaType("review")
                .child(
                  S.documentTypeList("review")
                    .title("Product Reviews")
                    .defaultOrdering([
                      { field: "createdAt", direction: "desc" },
                    ]),
                ),
            ]),
        ),

      S.divider(),

      // Page Design
      S.listItem()
        .title("Page Management")
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title("Home Banners")
            .items([
              S.listItem()
                .title("Home Banner")
                .icon(DocumentTextIcon)
                .schemaType("banner")
                .child(
                  S.documentTypeList("banner")
                    .title("Home Banners")
                    .defaultOrdering([
                      { field: "_createdAt", direction: "desc" },
                    ]),
                ),
            ]),
        ),

      S.divider(),

      // Restaurant Section
      S.listItem()
        .title("Restaurants")
        .icon(FolderIcon)
        .child(
          S.list()
            .title("Restaurants")
            .items([
              S.listItem()
                .title("All Restaurants")
                .icon(FolderIcon)
                .schemaType("restaurant")
                .child(
                  S.documentTypeList("restaurant")
                    .title("All Restaurants")
                    .defaultOrdering([{ field: "order", direction: "asc" }]),
                ),

              S.listItem()
                .title("Active Restaurants")
                .icon(FolderIcon)
                .schemaType("restaurant")
                .child(
                  S.documentTypeList("restaurant")
                    .title("Active Restaurants")
                    .filter("_type == 'restaurant' && isActive == true")
                    .defaultOrdering([{ field: "order", direction: "asc" }]),
                ),

              S.listItem()
                .title("Inactive Restaurants")
                .icon(FolderIcon)
                .schemaType("restaurant")
                .child(
                  S.documentTypeList("restaurant")
                    .title("Inactive Restaurants")
                    .filter("_type == 'restaurant' && isActive == false")
                    .defaultOrdering([{ field: "order", direction: "asc" }]),
                ),

              S.divider(),

              S.listItem()
                .title("Opening Hours")
                .icon(DocumentTextIcon)
                .schemaType("openingHours")
                .child(
                  S.documentTypeList("openingHours")
                    .title("Opening Hours")
                    .defaultOrdering([{ field: "name", direction: "asc" }]),
                ),
            ]),
        ),

      S.divider(),

      // Menus Section
      S.listItem()
        .title("Menus")
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title("Menus")
            .items([
              S.listItem()
                .title("All Menus")
                .icon(DocumentTextIcon)
                .schemaType("menu")
                .child(
                  S.documentTypeList("menu")
                    .title("All Menus")
                    .defaultOrdering([{ field: "order", direction: "asc" }]),
                ),
              S.listItem()
                .title("Active Menus")
                .icon(DocumentTextIcon)
                .schemaType("menu")
                .child(
                  S.documentTypeList("menu")
                    .title("Active Menus")
                    .filter("_type == 'menu' && isActive == true")
                    .defaultOrdering([{ field: "order", direction: "asc" }]),
                ),

              S.listItem()
                .title("Featured Menus")
                .icon(DocumentTextIcon)
                .schemaType("menu")
                .child(
                  S.documentTypeList("menu")
                    .title("Featured Menus")
                    .filter("_type == 'menu' && featured == true")
                    .defaultOrdering([{ field: "order", direction: "asc" }]),
                ),
            ]),
        ),
      S.divider(),

      // Order Section (Future)
      S.listItem()
        .title("Orders")
        .icon(BasketIcon)
        .child(
          S.list()
            .title("Orders")
            .items([
              S.listItem()
                .title("Order")
                .icon(BasketIcon)
                .schemaType("order")
                .child(
                  S.documentTypeList("order")
                    .title("No Orders Yet")
                    .filter("_type == 'order'"),
                ),
            ]),
        ),

      S.divider(),

      // Custom Section (Future)

      S.listItem()
        .title("Customers")
        .icon(UsersIcon)
        .child(
          S.list()
            .title("All Users")
            .items([
              S.listItem()
                .title("Users")
                .icon(UserIcon)
                .schemaType("user")
                .child(
                  S.documentTypeList("user")
                    .title("All Users")
                    .defaultOrdering([
                      {
                        field: "createdAt",
                        direction: "desc",
                      },
                    ]),
                ),
            ]),
        ),

      S.divider(),

      // Blog Section
      S.listItem()
        .title("Blog Management")
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title("Blog")
            .items([
              S.listItem()
                .title("All Posts")
                .icon(DocumentTextIcon)
                .schemaType("post")
                .child(
                  S.documentTypeList("post")
                    .title("All Posts")
                    .defaultOrdering([
                      {
                        field: "publishedAt",
                        direction: "desc",
                      },
                    ]),
                ),
              S.listItem()
                .title("Authors")
                .icon(DocumentTextIcon)
                .schemaType("author")
                .child(
                  S.documentTypeList("author")
                    .title("Authors")
                    .defaultOrdering([
                      {
                        field: "name",
                        direction: "asc",
                      },
                    ]),
                ),

              S.listItem()
                .title("Blog Categories")
                .icon(DocumentTextIcon)
                .schemaType("blogCategory")
                .child(
                  S.documentTypeList("blogCategory")
                    .title("Blog Categories")
                    .defaultOrdering([
                      {
                        field: "title",
                        direction: "asc",
                      },
                    ]),
                ),
            ]),
        ),

      S.divider(),

      // Address Section

      S.listItem()
        .title("Address Management")
        .icon(MapIcon)
        .child(
          S.list()
            .title("Address")
            .items([
              S.listItem()
                .title("All Addresses")
                .icon(MapIcon)
                .schemaType("address")
                .child(
                  S.documentTypeList("address")
                    .title("All Addresses")
                    .defaultOrdering([
                      {
                        field: "city",
                        direction: "asc",
                      },
                    ]),
                ),
            ]),
        ),
    ]);
