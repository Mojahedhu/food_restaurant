import { Ruler } from "lucide-react";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "restaurant",
  title: "Restaurants",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Restaurant Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) => Rule.required().min(10).max(1000),
    }),
    defineField({
      name: "image",
      title: "Restaurant Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "object",
      fields: [
        {
          name: "address",
          title: "Address",
          type: "string",
          validation: (Rule) => Rule.required(),
        },
        {
          name: "latitude",
          title: "Latitude",
          type: "number",
          validation: (Rule) => Rule.required().min(-90).max(90),
        },
        {
          name: "longitude",
          title: "Longitude",
          type: "number",
          validation: (Rule) => Rule.required().min(-180).max(180),
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "openingHours",
      title: "Opening Hours",
      type: "reference",
      to: [{ type: "openingHours" }],
      description: "Select opening hours schedule for this restaurant",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "AllFoodItemsAvailable",
      title: "Enable All Food Items",
      type: "boolean",
      description:
        "If enabled, all food items will be available for this restaurant",
    }),
    defineField({
      name: "foodItems",
      title: "Available Food Items",
      type: "array",
      of: [{ type: "reference", to: [{ type: "food" }] }],
      description: "Select food items available at this restaurant",
      hidden: ({ document }) => document?.AllFoodItemsAvailable === true,
    }),
    defineField({
      name: "categories",
      title: "Food Categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      description: "Categories of food available at this restaurant",
    }),
    defineField({
      name: "rating",
      title: "Average Rating",
      type: "number",
      validation: (Rule) => Rule.required().min(0).max(5),
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: "totalReviews",
      title: "Total Reviews",
      type: "number",
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description: "Is the restaurant currently accepting orders",
    }),
    defineField({
      name: "deliveryFee",
      title: "Delivery Fee",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
      initialValue: 0,
    }),
    defineField({
      name: "minimumOrder",
      title: "Minimum Order Amount",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
      initialValue: 0,
    }),
    defineField({
      name: "estimatedDeliveryTime",
      title: "Estimated Delivery Time (minutes)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
      initialValue: 30,
    }),
    defineField({
      name: "isFeatured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
      description: "Toggle to Featured this restaurant on the homepage",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 0,
      description: "User for sorting restaurants",
    }),
  ],
  preview: {
    select: {
      title: "name",
      address: "location.address",
      media: "image",
      isActive: "isActive",
    },
    prepare: ({ title, address, media, isActive }) => {
      return {
        title,
        subtitle: `${address} ${isActive ? "💹" : "❌"}`,
        media,
      };
    },
  },
});
