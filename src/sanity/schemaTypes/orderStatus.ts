import { defineType } from "sanity";

export default defineType({
  name: "orderStatus",
  title: "Order Status",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Status Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "value",
      title: "Status Value",
      type: "slug",
      description: "URL-friendly identifier for this status",
      options: {
        source: "title",
        maxLength: 50,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      description: "What this status means",
      rows: 2,
    },
    {
      name: "color",
      title: "Color",
      type: "string",
      description: "Enter hex color code (e.g., #3B82F6)",
      placeholder: "#3B82F6",
      initialValue: "#9CA3AAF",
      validation: (Rule) =>
        Rule.custom((value: string | undefined) => {
          if (!value) return true;
          const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
          return (
            hexRegex.test(value) ||
            "Please inter a valid hex color code e.g., #3B82F6"
          );
        }),
    },
    {
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Order in which this list appears in lists",
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: "isDefault",
      type: "boolean",
      title: "Is Default Status",
      description: "Use this status as the default for new orders",
      initialValue: false,
    },
    {
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      description: "Weather this status currently in use",
      initialValue: true,
    },
  ],
  preview: {
    select: {
      title: "title",
      description: "description",
      isDefault: "isDefault",
      isActive: "isActive",
    },
    prepare: ({ title, description, isDefault, isActive }) => {
      return {
        title: `${title}${isDefault ? ` (Default)` : ""}${!isActive ? " (Inactive)" : ""}`,
        subtitle: description,
      };
    },
  },
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
